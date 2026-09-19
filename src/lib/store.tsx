"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Profile,
  Vehicle,
  Contract,
  Payment,
  Inspection,
  MaintenanceRule,
  Maintenance,
  Fine,
  Expense,
  SystemSettings,
} from "@/types/database";
import {
  initialProfiles,
  initialVehicles,
  initialContracts,
  initialPayments,
  initialInspections,
  initialMaintenanceRules,
  initialMaintenances,
  initialFines,
  initialExpenses,
  initialSettings,
} from "./mock-data";
import { createClient } from "./supabase/client";

export interface AlertItem {
  id: string;
  vehicleId: string;
  vehiclePlaca: string;
  vehicleModelo: string;
  itemNome: string;
  kmAtual: number;
  kmLimite: number;
  kmRestante: number;
  tipo: "atencao" | "urgente";
  mensagem: string;
}

interface SevenDriveContextType {
  currentUser: Profile;
  setCurrentUser: (user: Profile) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  adminPassword: string;
  setAdminPassword: (newPass: string) => void;

  profiles: Profile[];
  vehicles: Vehicle[];
  contracts: Contract[];
  payments: Payment[];
  inspections: Inspection[];
  maintenanceRules: MaintenanceRule[];
  maintenances: Maintenance[];
  fines: Fine[];
  expenses: Expense[];
  settings: SystemSettings;
  activeAlerts: AlertItem[];

  // Veículos
  addVehicle: (vehicle: Omit<Vehicle, "id" | "created_at" | "updated_at">) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Motoristas
  addDriver: (driver: Omit<Profile, "id" | "created_at" | "updated_at">) => void;
  updateDriver: (id: string, updates: Partial<Profile>) => void;
  deleteDriver: (id: string) => void;

  // Contratos
  addContract: (contract: Omit<Contract, "id" | "created_at" | "updated_at">) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  generateWeeklyPaymentsForContract: (contractId: string, numberOfWeeks?: number) => void;

  // Pagamentos (Controle Total Admin)
  addPayment: (payment: Omit<Payment, "id" | "created_at" | "updated_at">) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  confirmPaymentAndInspection: (paymentId: string, observation?: string) => Promise<void>;
  rejectPaymentAndInspection: (paymentId: string, reason: string) => Promise<void>;
  resetPaymentIntention: (paymentId: string, reason?: string) => Promise<void>;

  // Wizard do Locatário
  submitPaymentAndInspection: (data: {
    paymentId: string;
    receiptUrl: string;
    kmRegistrado: number;
    photos: {
      frente: string;
      lateralEsq: string;
      lateralDir: string;
      traseira: string;
      interior: string;
      odometro: string;
    };
    observacoes?: string;
  }) => Promise<void>;

  // Sincronização e Atualização Manual
  refreshDataFromCloud: () => Promise<void>;

  // Manutenções
  addMaintenanceRule: (rule: Omit<MaintenanceRule, "id" | "created_at">) => void;
  updateMaintenanceRule: (id: string, updates: Partial<MaintenanceRule>) => void;
  addMaintenance: (maint: Omit<Maintenance, "id" | "created_at">) => void;
  deleteMaintenance: (id: string) => void;

  // Multas & Despesas
  addFine: (fine: Omit<Fine, "id" | "created_at">) => void;
  updateFine: (id: string, updates: Partial<Fine>) => void;
  deleteFine: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id" | "created_at">) => void;
  deleteExpense: (id: string) => void;

  // Limpeza de Dados Órfãos
  clearOrphanMockData: () => void;

  // Configurações
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // Saldo Líquido Consolidado por Veículo
  getVehicleFinancialSummary: (vehicleId: string) => {
    receitas: number;
    manutencoes: number;
    multas: number;
    despesas: number;
    saldoLiquido: number;
  };

  // Notificação Web Push
  triggerBrowserNotification: (title: string, body: string) => void;
}

const SevenDriveContext = createContext<SevenDriveContextType | undefined>(undefined);

export function SevenDriveProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPassword, setAdminPasswordState] = useState<string>("admin123");

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [maintenanceRules, setMaintenanceRules] = useState<MaintenanceRule[]>(initialMaintenanceRules);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);

  // Sincronização em Nuvem (Supabase) + Fallback LocalStorage
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  // Flag para evitar que dados recém-carregados do Supabase disparem um upsert de volta (race condition)
  const skipNextSyncRef = React.useRef(false);

  // 1. Carrega dados do Supabase na inicialização; Supabase é a fonte oficial da verdade
  const refreshDataFromCloud = async () => {
    const supabase = createClient();

    try {
      const [
        { data: cloudVehicles },
        { data: cloudProfiles },
        { data: cloudContracts },
        { data: cloudPayments },
        { data: cloudInspections },
        { data: cloudMaintenances },
        { data: cloudFines },
        { data: cloudExpenses },
        { data: cloudSettings },
      ] = await Promise.all([
        supabase.from("vehicles").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("contracts").select("*"),
        supabase.from("payments").select("*"),
        supabase.from("inspections").select("*"),
        supabase.from("maintenances").select("*"),
        supabase.from("fines").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("system_settings").select("*"),
      ]);

      if (cloudVehicles !== null) {
        // Sinaliza que os próximos sets são dados vindos da nuvem, NÃO devem disparar upsert de volta
        skipNextSyncRef.current = true;
        // Dados retornados do Supabase com sucesso
        setVehicles(cloudVehicles || []);
        if (cloudProfiles && cloudProfiles.length > 0) {
          setProfiles(cloudProfiles);
          const adminProf = cloudProfiles.find((p: any) => p.role === "admin");
          if (adminProf?.contato_emergencia?.startsWith("pwd:")) {
            const remotePass = adminProf.contato_emergencia.replace("pwd:", "");
            if (remotePass) {
              setAdminPasswordState(remotePass);
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("sevendrive_admin_pass", remotePass);
                } catch {}
              }
            }
          }
        } else {
          setProfiles(initialProfiles);
        }
        setContracts(cloudContracts || []);

        // Traduz o status "recusado" que foi salvo como "pendente_envio" no banco devido à restrição do Supabase
        const mappedPayments = (cloudPayments || []).map((p: any) => {
          if (p.status === "pendente_envio" && p.observacao_admin?.startsWith("RECUSADO:")) {
            return {
              ...p,
              status: "recusado",
              motivo_recusa: p.observacao_admin.replace("RECUSADO: ", ""),
            };
          }
          return p;
        });

        // Dedup: Remove duplicatas para o mesmo veículo na mesma data de vencimento
        // Mantém sempre o status mais avançado (confirmado > pendente_conferencia > pendente_envio)
        const uniquePayments = new Map<string, any>();
        mappedPayments.forEach((p: any) => {
          const key = `${p.vehicle_id}-${p.data_vencimento}`;
          const existing = uniquePayments.get(key);
          if (!existing) {
            uniquePayments.set(key, p);
          } else {
            const scores: Record<string, number> = { confirmado: 4, pendente_conferencia: 3, recusado: 2, atrasado: 1, pendente_envio: 0 };
            const scoreA = scores[p.status] || 0;
            const scoreB = scores[existing.status] || 0;
            // Fica com a intenção mais avançada OU a mais recente se o status for igual
            if (scoreA > scoreB || (scoreA === scoreB && new Date(p.updated_at).getTime() > new Date(existing.updated_at).getTime())) {
              uniquePayments.set(key, p);
              // Como estamos deletando o perdedor, vamos deletar do Supabase para limpar
              supabase.from("payments").delete().eq("id", existing.id).then();
            } else {
              supabase.from("payments").delete().eq("id", p.id).then();
            }
          }
        });
        
        setPayments(Array.from(uniquePayments.values()));
        
        setInspections(cloudInspections || []);
        setMaintenances(cloudMaintenances || []);
        setFines(cloudFines || []);
        setExpenses(cloudExpenses || []);
        if (cloudSettings && cloudSettings.length > 0) setSettings(cloudSettings[0] as any);
      } else {
        // Fallback somente se offline / sem conexão com o Supabase
        if (typeof window !== "undefined") {
          try {
            const savedVehicles = localStorage.getItem("sevendrive_vehicles");
            const savedProfiles = localStorage.getItem("sevendrive_profiles");
            const savedContracts = localStorage.getItem("sevendrive_contracts");
            const savedPayments = localStorage.getItem("sevendrive_payments");
            const savedInspections = localStorage.getItem("sevendrive_inspections");
            const savedMaintenances = localStorage.getItem("sevendrive_maintenances");
            const savedFines = localStorage.getItem("sevendrive_fines");
            const savedExpenses = localStorage.getItem("sevendrive_expenses");
            const savedSettings = localStorage.getItem("sevendrive_settings");

            if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
            if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
            if (savedContracts) setContracts(JSON.parse(savedContracts));
            if (savedPayments) setPayments(JSON.parse(savedPayments));
            if (savedInspections) setInspections(JSON.parse(savedInspections));
            if (savedMaintenances) setMaintenances(JSON.parse(savedMaintenances));
            if (savedFines) setFines(JSON.parse(savedFines));
            if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
            if (savedSettings) setSettings(JSON.parse(savedSettings));
          } catch (storageReadErr) {
            console.warn("Aviso ao ler do cache local:", storageReadErr);
          }
        }
      }
    } catch (err) {
      console.error("Erro conectando com Supabase, usando persistência local:", err);
    } finally {
      setIsCloudLoaded(true);
    }

    if (typeof window !== "undefined") {
      try {
        const sessionAuth = sessionStorage.getItem("sevendrive_admin_auth");
        if (sessionAuth === "true") {
          setIsAdminAuthenticated(true);
        }

        const savedPass = localStorage.getItem("sevendrive_admin_pass");
        if (savedPass) {
          setAdminPasswordState(savedPass);
        }
      } catch {}
    }
  };

  useEffect(() => {
    refreshDataFromCloud();
  }, []);

  // Salva no Supabase e no localStorage sempre que houver alterações
  useEffect(() => {
    if (!isCloudLoaded) return;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sevendrive_vehicles", JSON.stringify(vehicles));
        localStorage.setItem("sevendrive_profiles", JSON.stringify(profiles));
        localStorage.setItem("sevendrive_contracts", JSON.stringify(contracts));
        localStorage.setItem("sevendrive_payments", JSON.stringify(payments));
        localStorage.setItem("sevendrive_inspections", JSON.stringify(inspections));
        localStorage.setItem("sevendrive_maintenances", JSON.stringify(maintenances));
        localStorage.setItem("sevendrive_fines", JSON.stringify(fines));
        localStorage.setItem("sevendrive_expenses", JSON.stringify(expenses));
        localStorage.setItem("sevendrive_settings", JSON.stringify(settings));
        sessionStorage.setItem("sevendrive_admin_auth", String(isAdminAuthenticated));
        localStorage.setItem("sevendrive_admin_pass", adminPassword);
      } catch (quotaErr) {
        console.warn("LocalStorage atingiu cota de armazenamento, preservando funcionamento:", quotaErr);
        try {
          // Salva dados sem campos de fotos pesadas para não estourar a memória local do navegador
          const lightInspections = inspections.slice(0, 3).map((i) => ({
            id: i.id,
            payment_id: i.payment_id,
            vehicle_id: i.vehicle_id,
            driver_id: i.driver_id,
            km_registrado: i.km_registrado,
            status_conferencia: i.status_conferencia,
            observacoes: i.observacoes,
            created_at: i.created_at,
          }));
          localStorage.setItem("sevendrive_inspections", JSON.stringify(lightInspections));
        } catch {}
      }
    }

    // Persistência em Nuvem (Supabase)
    // Pula o upsert se os dados acabaram de ser carregados do Supabase (evita sobrescrever dados de outro dispositivo)
    if (skipNextSyncRef.current) {
      // Reseta a flag após um breve delay para cobrir todo o batch de state updates do React
      setTimeout(() => { skipNextSyncRef.current = false; }, 1500);
      return;
    }

    const supabase = createClient();
    async function syncToCloud() {
      try {
        if (profiles.length) await supabase.from("profiles").upsert(profiles);
        if (vehicles.length) await supabase.from("vehicles").upsert(vehicles);
        if (contracts.length) await supabase.from("contracts").upsert(contracts);
        
        if (payments.length) {
          // Prepara para o Supabase mapeando o status "recusado" (que não existe na constraint do banco) para "pendente_envio"
          const cloudSafePayments = payments.map(p => {
            const { motivo_recusa, ...rest } = p;
            if (rest.status === "recusado") {
              return {
                ...rest,
                status: "pendente_envio",
                observacao_admin: `RECUSADO: ${motivo_recusa || ""}`
              };
            }
            return rest;
          });
          await supabase.from("payments").upsert(cloudSafePayments);
        }
        
        if (inspections.length) await supabase.from("inspections").upsert(inspections);
        if (maintenances.length) await supabase.from("maintenances").upsert(maintenances);
        if (fines.length) await supabase.from("fines").upsert(fines);
        if (expenses.length) await supabase.from("expenses").upsert(expenses);
        if (settings) await supabase.from("system_settings").upsert([settings]);
      } catch (err) {
        console.warn("Aviso ao sincronizar dados na nuvem:", err);
      }
    }

    const timer = setTimeout(() => {
      syncToCloud();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    vehicles,
    profiles,
    contracts,
    payments,
    inspections,
    maintenances,
    fines,
    expenses,
    settings,
    isAdminAuthenticated,
    adminPassword,
    isCloudLoaded,
  ]);

  // Autenticação do Admin
  const loginAdmin = (password: string) => {
    if (password === adminPassword) {
      setIsAdminAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("sevendrive_admin_auth", "true");
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sevendrive_admin_auth");
      localStorage.removeItem("sevendrive_admin_auth");
    }
  };

  const setAdminPassword = async (newPass: string) => {
    setAdminPasswordState(newPass);
    if (typeof window !== "undefined") {
      localStorage.setItem("sevendrive_admin_pass", newPass);
    }
    // Atualiza o campo contato_emergencia no estado local do profile admin
    // para que o upsert genérico NÃO sobrescreva a senha com o valor antigo
    setProfiles((prev) =>
      prev.map((p) =>
        p.role === "admin"
          ? { ...p, contato_emergencia: `pwd:${newPass}`, updated_at: new Date().toISOString() }
          : p
      )
    );
    // Sincroniza senha no banco através do profile do admin
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ contato_emergencia: `pwd:${newPass}`, updated_at: new Date().toISOString() })
        .eq("role", "admin");
    } catch (e) {
      console.warn("Não foi possível salvar senha no Supabase:", e);
    }
  };

  // Limpeza de Dados Órfãos (Garante que custos e dados de veículos deletados sumam do Dashboard)
  const clearOrphanMockData = () => {
    const existingVehIds = new Set(vehicles.map((v) => v.id));
    const existingDriverIds = new Set(profiles.map((p) => p.id));

    setContracts((prev) => prev.filter((c) => existingVehIds.has(c.vehicle_id) && existingDriverIds.has(c.driver_id)));
    setPayments((prev) => prev.filter((p) => existingVehIds.has(p.vehicle_id)));
    setInspections((prev) => prev.filter((i) => existingVehIds.has(i.vehicle_id)));
    setMaintenances((prev) => prev.filter((m) => existingVehIds.has(m.vehicle_id)));
    setFines((prev) => prev.filter((f) => existingVehIds.has(f.vehicle_id)));
    setExpenses((prev) => prev.filter((e) => existingVehIds.has(e.vehicle_id)));
  };

  // Garante automaticamente que contratos ativos sempre tenham as próximas semanas geradas sem intervenção manual
  useEffect(() => {
    if (contracts.length > 0) {
      contracts.forEach((c) => {
        if (c.status === "ativo") {
          ensureFuturePaymentsForContract(c.id, 6);
        }
      });
    }
  }, [contracts.length]);

  // Cálculo Dinâmico de Alertas Duplos de Manutenção por KM (Apenas veículos existentes!)
  useEffect(() => {
    const alerts: AlertItem[] = [];

    vehicles.forEach((veh) => {
      maintenanceRules.forEach((rule) => {
        if (!rule.ativo) return;

        const lastMaint = maintenances
          .filter((m) => m.vehicle_id === veh.id && m.tipo_item.toLowerCase().includes(rule.nome_item.toLowerCase()))
          .sort((a, b) => b.km_realizado - a.km_realizado)[0];

        const kmBase = lastMaint ? lastMaint.km_realizado : veh.km_inicial;
        const kmProximaRevisao = kmBase + rule.intervalo_km;
        const kmRestante = kmProximaRevisao - veh.km_atual;

        if (kmRestante <= rule.alerta_vermelho_km) {
          alerts.push({
            id: `alert-${veh.id}-${rule.id}-red`,
            vehicleId: veh.id,
            vehiclePlaca: veh.placa,
            vehicleModelo: `${veh.marca} ${veh.modelo}`,
            itemNome: rule.nome_item,
            kmAtual: veh.km_atual,
            kmLimite: kmProximaRevisao,
            kmRestante: Math.max(0, kmRestante),
            tipo: "urgente",
            mensagem: `URGENTE: ${rule.nome_item} deve ser feita em ${Math.max(0, kmRestante)} km (Limite: ${kmProximaRevisao.toLocaleString('pt-BR')} km)!`,
          });
        } else if (kmRestante <= rule.alerta_amarelo_km) {
          alerts.push({
            id: `alert-${veh.id}-${rule.id}-yellow`,
            vehicleId: veh.id,
            vehiclePlaca: veh.placa,
            vehicleModelo: `${veh.marca} ${veh.modelo}`,
            itemNome: rule.nome_item,
            kmAtual: veh.km_atual,
            kmLimite: kmProximaRevisao,
            kmRestante,
            tipo: "atencao",
            mensagem: `ATENÇÃO: ${rule.nome_item} se aproxima em ${kmRestante} km (Limite: ${kmProximaRevisao.toLocaleString('pt-BR')} km).`,
          });
        }
      });
    });

    setActiveAlerts(alerts);
  }, [vehicles, maintenanceRules, maintenances]);

  // Disparo de Notificação no Navegador (Compatível e seguro para Mobile e Desktop com ação de clique)
  const triggerBrowserNotification = (title: string, body: string, targetUrl: string = "/motorista") => {
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        const createAndBind = () => {
          try {
            const notif = new Notification(title, {
              body,
              icon: "/favicon.ico",
            });
            notif.onclick = () => {
              try {
                window.focus();
                window.location.href = targetUrl;
              } catch {}
            };
          } catch {
            // Fallback para navegadores móveis que não suportam construtor direto
          }
        };

        if (Notification.permission === "granted") {
          createAndBind();
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission()
            .then((permission) => {
              if (permission === "granted") {
                createAndBind();
              }
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Disparo de notificação omitido suavemente:", err);
    }
  };

  // Veículos (Exclusão em Cascata)
  const addVehicle = (vehicleData: Omit<Vehicle, "id" | "created_at" | "updated_at">) => {
    const newVeh: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setVehicles((prev) => [newVeh, ...prev]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updated_at: new Date().toISOString() } : v))
    );
  };

  const deleteVehicle = async (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    // Limpeza em cascata de tudo que pertencia a este veículo no state
    setContracts((prev) => prev.filter((c) => c.vehicle_id !== id));
    setPayments((prev) => prev.filter((p) => p.vehicle_id !== id));
    setInspections((prev) => prev.filter((i) => i.vehicle_id !== id));
    setMaintenances((prev) => prev.filter((m) => m.vehicle_id !== id));
    setFines((prev) => prev.filter((f) => f.vehicle_id !== id));
    setExpenses((prev) => prev.filter((e) => e.vehicle_id !== id));

    // Exclusão definitiva em cascata no Supabase
    try {
      const supabase = createClient();
      await Promise.allSettled([
        supabase.from("expenses").delete().eq("vehicle_id", id),
        supabase.from("fines").delete().eq("vehicle_id", id),
        supabase.from("maintenances").delete().eq("vehicle_id", id),
        supabase.from("inspections").delete().eq("vehicle_id", id),
        supabase.from("payments").delete().eq("vehicle_id", id),
        supabase.from("contracts").delete().eq("vehicle_id", id),
        supabase.from("vehicles").delete().eq("id", id),
      ]);
    } catch (err) {
      console.error("Erro ao deletar veículo no Supabase:", err);
    }
  };

  // Motoristas
  const addDriver = (driverData: Omit<Profile, "id" | "created_at" | "updated_at">) => {
    const newDriver: Profile = {
      ...driverData,
      id: `driver-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newDriver]);
  };

  const updateDriver = (id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteDriver = async (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setContracts((prev) => prev.filter((c) => c.driver_id !== id));
    setPayments((prev) => prev.filter((p) => p.driver_id !== id));

    // Exclusão definitiva no Supabase
    try {
      const supabase = createClient();
      await Promise.allSettled([
        supabase.from("payments").delete().eq("driver_id", id),
        supabase.from("contracts").delete().eq("driver_id", id),
        supabase.from("profiles").delete().eq("id", id),
      ]);
    } catch (err) {
      console.error("Erro ao deletar motorista no Supabase:", err);
    }
  };

  // Contratos & Geração Semanal de Pagamentos
  const addContract = (contractData: Omit<Contract, "id" | "created_at" | "updated_at">) => {
    const newId = `cont-${Date.now()}`;
    const newContract: Contract = {
      ...contractData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setContracts((prev) => [newContract, ...prev]);
    updateVehicle(contractData.vehicle_id, { status: "alugado" });

    // Gera automaticamente as primeiras 4 parcelas semanais para o dia da semana configurado
    setTimeout(() => {
      generateWeeklyPaymentsForContract(newId, 4);
    }, 100);
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );

    // Se o valor do aluguel mudou, sincroniza os pagamentos pendentes deste contrato
    if (updates.valor_aluguel !== undefined) {
      setPayments((prev) =>
        prev.map((p) =>
          p.contract_id === id && p.status === "pendente_envio"
            ? { ...p, valor: Number(updates.valor_aluguel), updated_at: new Date().toISOString() }
            : p
        )
      );
    }

    try {
      const supabase = createClient();
      await supabase
        .from("contracts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updates.valor_aluguel !== undefined) {
        await supabase
          .from("payments")
          .update({ valor: Number(updates.valor_aluguel), updated_at: new Date().toISOString() })
          .eq("contract_id", id)
          .eq("status", "pendente_envio");
      }
    } catch (err) {
      console.error("Erro ao atualizar contrato no Supabase:", err);
    }
  };

  const deleteContract = async (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    try {
      const supabase = createClient();
      await supabase.from("contracts").delete().eq("id", id);
    } catch (err) {
      console.error("Erro ao deletar contrato no Supabase:", err);
    }
  };

  // Garante que existam parcelas geradas continuamente para as próximas semanas
  const ensureFuturePaymentsForContract = (contractId: string, minWeeksAhead: number = 6) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract || contract.status !== "ativo") return;

    // Mapeamento: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo
    const targetDayOfWeek = contract.dia_vencimento === 7 ? 0 : contract.dia_vencimento;

    // Encontra o último pagamento existente deste contrato ou a data de início
    const contractPayments = payments
      .filter((p) => p.contract_id === contract.id)
      .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

    let lastDueDate: Date;
    if (contractPayments.length > 0) {
      lastDueDate = new Date(contractPayments[contractPayments.length - 1].data_vencimento + "T12:00:00");
    } else {
      const baseDate = new Date(contract.data_inicio + "T12:00:00");
      lastDueDate = new Date(baseDate);
      while (lastDueDate.getDay() !== targetDayOfWeek) {
        lastDueDate.setDate(lastDueDate.getDate() + 1);
      }
      // Retrocede 7 dias para que o loop comece nele
      lastDueDate.setDate(lastDueDate.getDate() - 7);
    }

    const today = new Date();
    const limitFutureDate = new Date(today);
    limitFutureDate.setDate(limitFutureDate.getDate() + (minWeeksAhead * 7));

    const newPayments: Payment[] = [];
    let curDate = new Date(lastDueDate);

    // Itera adicionando semanas enquanto a última data for menor que o limite futuro
    while (curDate < limitFutureDate) {
      curDate.setDate(curDate.getDate() + 7);
      const dueDateStr = curDate.toISOString().split("T")[0];

      const alreadyExists = payments.some(
        (p) => p.contract_id === contract.id && p.data_vencimento === dueDateStr
      );

      if (!alreadyExists) {
        const d = new Date(Date.UTC(curDate.getFullYear(), curDate.getMonth(), curDate.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

        newPayments.push({
          id: `pay-${contract.id}-${dueDateStr}`,
          contract_id: contract.id,
          vehicle_id: contract.vehicle_id,
          driver_id: contract.driver_id,
          valor: contract.valor_aluguel,
          data_vencimento: dueDateStr,
          status: "pendente_envio",
          semana_ano: `${curDate.getFullYear()}-${weekNo}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (newPayments.length > 0) {
      setPayments((prev) => [...prev, ...newPayments]);
    }
  };

  // Gerador de Parcelas Semanais pelo Dia Fixo da Semana
  const generateWeeklyPaymentsForContract = (contractId: string, numberOfWeeks: number = 4) => {
    ensureFuturePaymentsForContract(contractId, numberOfWeeks);
  };

  // Pagamentos
  const addPayment = (paymentData: Omit<Payment, "id" | "created_at" | "updated_at">) => {
    const newPay: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPayments((prev) => [newPay, ...prev]);
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const deletePayment = async (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    try {
      const supabase = createClient();
      await supabase.from("payments").delete().eq("id", id);
    } catch (err) {
      console.error("Erro ao deletar pagamento no Supabase:", err);
    }
  };

  // Wizard do Locatário
  const submitPaymentAndInspection = async (data: {
    paymentId: string;
    receiptUrl: string;
    kmRegistrado: number;
    photos: {
      frente: string;
      lateralEsq: string;
      lateralDir: string;
      traseira: string;
      interior: string;
      odometro: string;
    };
    observacoes?: string;
  }) => {
    const targetPayment = payments.find((p) => p.id === data.paymentId);
    if (!targetPayment) return;

    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      payment_id: data.paymentId,
      vehicle_id: targetPayment.vehicle_id,
      driver_id: targetPayment.driver_id,
      km_registrado: data.kmRegistrado,
      foto_frente_url: data.photos.frente,
      foto_lateral_esq_url: data.photos.lateralEsq,
      foto_lateral_dir_url: data.photos.lateralDir,
      foto_traseira_url: data.photos.traseira,
      foto_interior_url: data.photos.interior,
      foto_odometro_url: data.photos.odometro,
      observacoes: data.observacoes || "",
      status_conferencia: "pendente",
      created_at: new Date().toISOString(),
    };

    setInspections((prev) => [newInspection, ...prev]);

    setPayments((prev) =>
      prev.map((p) =>
        p.id === data.paymentId
          ? {
              ...p,
              status: "pendente_conferencia",
              comprovante_url: data.receiptUrl,
              motivo_recusa: null,
              data_pagamento: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );

    // Salva imediatamente no banco na nuvem (Supabase)
    try {
      const supabase = createClient();
      await Promise.allSettled([
        supabase.from("inspections").upsert([newInspection]),
        supabase.from("payments").update({
          status: "pendente_conferencia",
          comprovante_url: data.receiptUrl,
          data_pagamento: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", data.paymentId),
      ]);
    } catch (cloudErr) {
      console.warn("Aviso ao sincronizar vistoria e pagamento no Supabase:", cloudErr);
    }

    triggerBrowserNotification(
      "Seven Drive - Novo Pagamento Enviado",
      `O motorista enviou comprovante e vistoria (${data.kmRegistrado} km) para conferência.`,
      "/admin/conferencia"
    );
  };

  // Dupla Checagem: Confirmar e Dar Baixa
  const confirmPaymentAndInspection = async (paymentId: string, observation?: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const updatedPayment = {
      ...payment,
      status: "confirmado" as const,
      observacao_admin: observation || "Confirmado e baixado pelo Locador.",
      updated_at: new Date().toISOString(),
    };

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? updatedPayment : p))
    );

    const inspection = inspections.find((i) => i.payment_id === paymentId);
    if (inspection) {
      setInspections((prev) =>
        prev.map((i) => (i.id === inspection.id ? { ...i, status_conferencia: "aprovada" } : i))
      );

      if (inspection.km_registrado > 0) {
        updateVehicle(payment.vehicle_id, {
          km_atual: inspection.km_registrado,
        });
      }
    }

    try {
      const supabase = createClient();
      await Promise.allSettled([
        supabase.from("payments").update({
          status: "confirmado",
          observacao_admin: observation || "Confirmado e baixado pelo Locador.",
          updated_at: new Date().toISOString(),
        }).eq("id", paymentId),
        inspection
          ? supabase.from("inspections").update({
              status_conferencia: "aprovada",
            }).eq("id", inspection.id)
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.warn("Aviso ao atualizar confirmação no Supabase:", err);
    }
  };

  // Dupla Checagem: Recusar Intenção de Pagamento com Motivo
  const rejectPaymentAndInspection = async (paymentId: string, reason: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const updatedPayment = {
      ...payment,
      status: "recusado" as const,
      motivo_recusa: reason,
      observacao_admin: `Recusado pelo Locador: ${reason}`,
      updated_at: new Date().toISOString(),
    };

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? updatedPayment : p))
    );

    const inspection = inspections.find((i) => i.payment_id === paymentId);
    if (inspection) {
      setInspections((prev) =>
        prev.map((i) => (i.id === inspection.id ? { ...i, status_conferencia: "rejeitada" } : i))
      );
    }

    try {
      const supabase = createClient();
      await Promise.allSettled([
        supabase.from("payments").update({
          // O status "recusado" não existe na constraint do banco original, 
          // então enviamos como pendente_envio e usamos a observação como flag
          status: "pendente_envio",
          observacao_admin: `RECUSADO: ${reason}`,
          updated_at: new Date().toISOString(),
        }).eq("id", paymentId),
        inspection
          ? supabase.from("inspections").update({
              status_conferencia: "rejeitada",
            }).eq("id", inspection.id)
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.warn("Aviso ao atualizar recusa no Supabase:", err);
    }

    triggerBrowserNotification(
      "Seven Drive - Pagamento Recusado",
      `A intenção de pagamento foi recusada pelo locador. Motivo: ${reason}`,
      "/motorista"
    );
  };

  // Excluir Intenção (Reseta para pendente_envio, atualiza valor e limpa dados)
  const resetPaymentIntention = async (paymentId: string, reason?: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    const contract = contracts.find((c) => c.id === payment.contract_id);
    if (!contract) return;

    const updatedPayment = {
      ...payment,
      status: "pendente_envio" as const,
      valor: contract.valor_aluguel,
      comprovante_url: null as any,
      motivo_recusa: null as any,
      observacao_admin: reason ? `Excluído: ${reason}` : null,
      updated_at: new Date().toISOString(),
    };

    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? updatedPayment : p))
    );

    setInspections((prev) => prev.filter((i) => i.payment_id !== paymentId));

    try {
      const supabase = createClient();
      await Promise.allSettled([
        supabase.from("payments").update({
          status: "pendente_envio",
          valor: contract.valor_aluguel,
          comprovante_url: null,
          observacao_admin: reason ? `Excluído: ${reason}` : null,
          updated_at: new Date().toISOString(),
        }).eq("id", paymentId),
        supabase.from("inspections").delete().eq("payment_id", paymentId),
      ]);
    } catch (err) {
      console.warn("Aviso ao excluir intenção no Supabase:", err);
    }
  };

  // Manutenções
  const addMaintenanceRule = (ruleData: Omit<MaintenanceRule, "id" | "created_at">) => {
    const newRule: MaintenanceRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setMaintenanceRules((prev) => [...prev, newRule]);
  };

  const updateMaintenanceRule = (id: string, updates: Partial<MaintenanceRule>) => {
    setMaintenanceRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const addMaintenance = (maintData: Omit<Maintenance, "id" | "created_at">) => {
    const newMaint: Maintenance = {
      ...maintData,
      id: `maint-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setMaintenances((prev) => [newMaint, ...prev]);

    if (maintData.km_realizado) {
      const veh = vehicles.find((v) => v.id === maintData.vehicle_id);
      if (veh && maintData.km_realizado > veh.km_atual) {
        updateVehicle(veh.id, { km_atual: maintData.km_realizado });
      }
    }
  };

  const deleteMaintenance = async (id: string) => {
    setMaintenances((prev) => prev.filter((m) => m.id !== id));
    try {
      const supabase = createClient();
      await supabase.from("maintenances").delete().eq("id", id);
    } catch (err) {
      console.error("Erro ao deletar manutenção no Supabase:", err);
    }
  };

  // Multas
  const addFine = (fineData: Omit<Fine, "id" | "created_at">) => {
    const newFine: Fine = {
      ...fineData,
      id: `fine-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setFines((prev) => [newFine, ...prev]);
  };

  const updateFine = (id: string, updates: Partial<Fine>) => {
    setFines((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFine = async (id: string) => {
    setFines((prev) => prev.filter((f) => f.id !== id));
    try {
      const supabase = createClient();
      await supabase.from("fines").delete().eq("id", id);
    } catch (err) {
      console.error("Erro ao deletar multa no Supabase:", err);
    }
  };

  // Despesas (Custos Extras: Seguro, IPVA, Licenciamento, etc.)
  const addExpense = async (expData: Omit<Expense, "id" | "created_at">) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);

    try {
      const supabase = createClient();
      await supabase.from("expenses").insert([newExp]);
    } catch (err) {
      console.error("Erro ao salvar despesa no Supabase:", err);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      const supabase = createClient();
      await supabase.from("expenses").delete().eq("id", id);
    } catch (err) {
      console.error("Erro ao deletar despesa no Supabase:", err);
    }
  };

  // Configurações
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
    setSettings(updated);
    try {
      const supabase = createClient();
      await supabase.from("system_settings").upsert([updated]);
    } catch (err) {
      console.error("Erro ao salvar configurações no Supabase:", err);
    }
  };

  // Saldo Líquido Consolidado por Veículo (Filtra rigorosamente)
  const getVehicleFinancialSummary = (vehicleId: string) => {
    const confirmedPayments = payments.filter((p) => p.vehicle_id === vehicleId && p.status === "confirmado");
    const receitas = confirmedPayments.reduce((acc, curr) => acc + Number(curr.valor), 0);

    const vehicleMaintenances = maintenances.filter((m) => m.vehicle_id === vehicleId);
    const totalMaint = vehicleMaintenances.reduce((acc, curr) => acc + Number(curr.valor_custo || 0), 0);

    const vehicleFines = fines.filter((f) => f.vehicle_id === vehicleId && f.status_pagamento === "pago_locador");
    const totalFines = vehicleFines.reduce((acc, curr) => acc + Number(curr.valor), 0);

    const vehicleExpenses = expenses.filter((e) => e.vehicle_id === vehicleId);
    const totalExpenses = vehicleExpenses.reduce((acc, curr) => acc + Number(curr.valor), 0);

    const despesasTotais = totalMaint + totalFines + totalExpenses;
    const saldoLiquido = receitas - despesasTotais;

    return {
      receitas,
      manutencoes: totalMaint,
      multas: totalFines,
      despesas: totalExpenses,
      saldoLiquido,
    };
  };

  return (
    <SevenDriveContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        adminPassword,
        setAdminPassword,
        profiles,
        vehicles,
        contracts,
        payments,
        inspections,
        maintenanceRules,
        maintenances,
        fines,
        expenses,
        settings,
        activeAlerts,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addContract,
        updateContract,
        deleteContract,
        generateWeeklyPaymentsForContract,
        addPayment,
        updatePayment,
        deletePayment,
        confirmPaymentAndInspection,
        rejectPaymentAndInspection,
        resetPaymentIntention,
        submitPaymentAndInspection,
        addMaintenanceRule,
        updateMaintenanceRule,
        addMaintenance,
        deleteMaintenance,
        addFine,
        updateFine,
        deleteFine,
        addExpense,
        deleteExpense,
        clearOrphanMockData,
        updateSettings,
        getVehicleFinancialSummary,
        triggerBrowserNotification,
        refreshDataFromCloud,
      }}
    >
      {children}
    </SevenDriveContext.Provider>
  );
}

export function useSevenDrive() {
  const context = useContext(SevenDriveContext);
  if (!context) {
    throw new Error("useSevenDrive must be used within a SevenDriveProvider");
  }
  return context;
}
