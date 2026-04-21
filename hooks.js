import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ─── AUTH ────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const logout = async () => { await supabase.auth.signOut(); };

  const isAdmin = user?.user_metadata?.role === "platform_admin";

  return { user, loading, login, logout, isAdmin };
}

// ─── CLUB ────────────────────────────────────────────────────
export function useClub(userId) {
  const [club, setClub]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("tp_club_managers")
      .select("club_id, tp_clubs(*)")
      .eq("user_id", userId)
      .single();
    if (data?.tp_clubs) setClub(data.tp_clubs);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateClub = async (updates) => {
    if (!club?.id) return { error: "Clube não encontrado" };
    const { data, error } = await supabase
      .from("tp_clubs")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", club.id)
      .select()
      .single();
    if (!error) setClub(data);
    return { data, error };
  };

  return { club, loading, refresh: fetch, updateClub };
}

// ─── DASHBOARD ───────────────────────────────────────────────
export function useDashboard(clubId) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("tp_view_club_financial")
        .select("*")
        .eq("club_id", clubId)
        .single();
      setMetrics(data);
      setLoading(false);
    };
    load();
  }, [clubId]);

  return { metrics, loading };
}

// ─── MEMBERS ─────────────────────────────────────────────────
export function useMembers(clubId, { search = "", status = "all", plan = "all", page = 1, perPage = 8 } = {}) {
  const [members, setMembers] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    let query = supabase
      .from("tp_view_active_members")
      .select("*", { count: "exact" })
      .eq("club_id", clubId);

    if (status !== "all") query = query.eq("subscription_status", status);
    if (plan   !== "all") query = query.eq("plan_name", plan);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);

    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1).order("member_number", { ascending: true });

    const { data, count, error } = await query;
    if (!error) { setMembers(data || []); setTotal(count || 0); }
    setLoading(false);
  }, [clubId, search, status, plan, page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);

  const createMember = async (memberData) => {
    const { data, error } = await supabase
      .from("tp_members")
      .insert({ ...memberData, club_id: clubId })
      .select()
      .single();
    if (!error) await fetch();
    return { data, error };
  };

  const updateMember = async (id, updates) => {
    const { data, error } = await supabase
      .from("tp_members")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (!error) await fetch();
    return { data, error };
  };

  const cancelMember = async (memberId, subscriptionId) => {
    await supabase.from("tp_subscriptions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", subscriptionId);
    await supabase.from("tp_members").update({ status: "cancelled" }).eq("id", memberId);
    await fetch();
  };

  return { members, total, loading, refresh: fetch, createMember, updateMember, cancelMember };
}

// ─── PLANS ───────────────────────────────────────────────────
export function usePlans(clubId) {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tp_plans")
      .select("*, tp_plan_benefits(*)")
      .eq("club_id", clubId)
      .order("display_order", { ascending: true });
    if (!error) setPlans(data || []);
    setLoading(false);
  }, [clubId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createPlan = async ({ benefits = [], ...planData }) => {
    const { data: plan, error } = await supabase
      .from("tp_plans")
      .insert({ ...planData, club_id: clubId })
      .select()
      .single();
    if (error) return { error };
    if (benefits.length) {
      await supabase.from("tp_plan_benefits").insert(
        benefits.map(b => ({ ...b, plan_id: plan.id }))
      );
    }
    await fetch();
    return { data: plan, error: null };
  };

  const updatePlan = async (planId, { benefits, ...planData }) => {
    await supabase.from("tp_plans").update({ ...planData, updated_at: new Date().toISOString() }).eq("id", planId);
    if (benefits !== undefined) {
      await supabase.from("tp_plan_benefits").delete().eq("plan_id", planId);
      if (benefits.length) {
        await supabase.from("tp_plan_benefits").insert(
          benefits.map(({ id, ...b }) => ({ ...b, plan_id: planId }))
        );
      }
    }
    await fetch();
    return { error: null };
  };

  const deletePlan = async (planId) => {
    const { error } = await supabase.from("tp_plans").delete().eq("id", planId);
    if (!error) await fetch();
    return { error };
  };

  const togglePlan = async (planId, isActive) => {
    await supabase.from("tp_plans").update({ is_active: isActive }).eq("id", planId);
    await fetch();
  };

  return { plans, loading, refresh: fetch, createPlan, updatePlan, deletePlan, togglePlan };
}

// ─── RAFFLES ─────────────────────────────────────────────────
export function useRaffles(clubId) {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tp_view_raffles_summary")
      .select("*")
      .eq("club_id", clubId)
      .order("draw_date", { ascending: false });
    if (!error) setRaffles(data || []);
    setLoading(false);
  }, [clubId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createRaffle = async (raffleData) => {
    const { data, error } = await supabase
      .from("tp_raffles")
      .insert({ ...raffleData, club_id: clubId })
      .select()
      .single();
    if (!error) await fetch();
    return { data, error };
  };

  const drawRaffle = async (raffleId) => {
    const { data: entries } = await supabase
      .from("tp_raffle_entries")
      .select("member_id, chances, tp_members(name, whatsapp)")
      .eq("raffle_id", raffleId);

    if (!entries?.length) return { error: "Nenhum participante" };

    const pool = [];
    entries.forEach(e => { for (let i = 0; i < e.chances; i++) pool.push(e); });
    const winner = pool[Math.floor(Math.random() * pool.length)];

    await supabase
      .from("tp_raffles")
      .update({ status: "drawn", winner_member_id: winner.member_id })
      .eq("id", raffleId);

    await fetch();
    return { winner };
  };

  return { raffles, loading, refresh: fetch, createRaffle, drawRaffle };
}

// ─── PAYMENTS ────────────────────────────────────────────────
export function usePayments(clubId, { page = 1, perPage = 20 } = {}) {
  const [payments, setPayments] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!clubId) return;
    const load = async () => {
      setLoading(true);
      const from = (page - 1) * perPage;
      const { data, count } = await supabase
        .from("tp_payments")
        .select("*, tp_members(name, whatsapp)", { count: "exact" })
        .eq("club_id", clubId)
        .order("created_at", { ascending: false })
        .range(from, from + perPage - 1);
      setPayments(data || []);
      setTotal(count || 0);
      setLoading(false);
    };
    load();
  }, [clubId, page, perPage]);

  return { payments, total, loading };
}
