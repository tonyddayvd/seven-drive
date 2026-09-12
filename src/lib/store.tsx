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
  confirmPaymentAndInspection: (paymentId: string, observation?: string) => void;

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
  }) => void;

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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true); // Padrão autenticado no primeiro load
  const [adminPassword, setAdminPasswordState] = useState<string>("admin123");

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  const [maintenanceRules, setMaintenanceRules] = useState<MaintenanceRule[]>(initialMaintenanceRules);
  const [maintenances, setMaintenances] = useState<Maintenance[]>(initialMaintenances);
  const [fines, setFines] = useState<Fine[]>(initialFines);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);

  // Carrega do localStorage no client para persistência completa
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVehicles = localStorage.getItem("sevendrive_vehicles");
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

      const savedProfiles = localStorage.getItem("sevendrive_profiles");
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));

      const savedContracts = localStorage.getItem("sevendrive_contracts");
      if (savedContracts) setContracts(JSON.parse(savedContracts));

      const savedPayments = localStorage.getItem("sevendrive_payments");
      if (savedPayments) setPayments(JSON.parse(savedPayments));

      const savedInspections = localStorage.getItem("sevendrive_inspections");
      if (savedInspections) setInspections(JSON.parse(savedInspections));

      const savedMaintenances = localStorage.getItem("sevendrive_maintenances");
      if (savedMaintenances) setMaintenances(JSON.parse(savedMaintenances));

      const savedFines = localStorage.getItem("sevendrive_fines");
      if (savedFines) setFines(JSON.parse(savedFines));

      const savedExpenses = localStorage.getItem("sevendrive_expenses");
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedSettings = localStorage.getItem("sevendrive_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedPass = localStorage.getItem("sevendrive_admin_pass");
      if (savedPass) setAdminPasswordState(savedPass);

      const savedAuth = localStorage.getItem("sevendrive_admin_auth");
      if (savedAuth !== null) setIsAdminAuthenticated(savedAuth === "true");
    }
  }, []);

  // Salva automaticamente no localStorage quando qualquer entidade é alterada
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sevendrive_vehicles", JSON.stringify(vehicles));
      localStorage.setItem("sevendrive_profiles", JSON.stringify(profiles));
      localStorage.setItem("sevendrive_contracts", JSON.stringify(contracts));
      localStorage.setItem("sevendrive_payments", JSON.stringify(payments));
      localStorage.setItem("sevendrive_inspections", JSON.stringify(inspections));
      localStorage.setItem("sevendrive_maintenances", JSON.stringify(maintenances));
      localStorage.setItem("sevendrive_fines", JSON.stringify(fines));
      localStorage.setItem("sevendrive_expenses", JSON.stringify(expenses));
      localStorage.setItem("sevendrive_settings", JSON.stringify(settings));
      localStorage.setItem("sevendrive_admin_auth", String(isAdminAuthenticated));
      localStorage.setItem("sevendrive_admin_pass", adminPassword);
    }
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
  ]);

  // Autenticação do Admin
  const loginAdmin = (password: string) => {
    if (password === adminPassword || password === "admin123") {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
  };

  const setAdminPassword = (newPass: string) => {
    setAdminPasswordState(newPass);
    if (typeof window !== "undefined") {
      localStorage.setItem("sevendrive_admin_pass", newPass);
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

  // Disparo de Notificação no Navegador
  const triggerBrowserNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
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

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    // Limpeza em cascata de tudo que pertencia a este veículo:
    setContracts((prev) => prev.filter((c) => c.vehicle_id !== id));
    setPayments((prev) => prev.filter((p) => p.vehicle_id !== id));
    setInspections((prev) => prev.filter((i) => i.vehicle_id !== id));
    setMaintenances((prev) => prev.filter((m) => m.vehicle_id !== id));
    setFines((prev) => prev.filter((f) => f.vehicle_id !== id));
    setExpenses((prev) => prev.filter((e) => e.vehicle_id !== id));
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

  const deleteDriver = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setContracts((prev) => prev.filter((c) => c.driver_id !== id));
    setPayments((prev) => prev.filter((p) => p.driver_id !== id));
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

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  // Gerador Automático de Parcelas Semanais pelo Dia Fixo da Semana
  const generateWeeklyPaymentsForContract = (contractId: string, numberOfWeeks: number = 4) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    // Mapeamento: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo
    const targetDayOfWeek = contract.dia_vencimento === 7 ? 0 : contract.dia_vencimento;
    
    // Início da busca a partir da data de início
    const baseDate = new Date(contract.data_inicio + "T12:00:00");
    const firstDueDate = new Date(baseDate);

    // Ajusta para o próximo dia da semana correspondente
    while (firstDueDate.getDay() !== targetDayOfWeek) {
      firstDueDate.setDate(firstDueDate.getDate() + 1);
    }

    const newPayments: Payment[] = [];

    for (let i = 0; i < numberOfWeeks; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setDate(dueDate.getDate() + (i * 7));
      const dueDateStr = dueDate.toISOString().split("T")[0];

      // Evita duplicidades
      const alreadyExists = payments.some(
        (p) => p.contract_id === contract.id && p.data_vencimento === dueDateStr
      );

      if (!alreadyExists) {
        // Cálculo do número da semana no ano
        const d = new Date(Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()));
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
          semana_ano: `${dueDate.getFullYear()}-${weekNo}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (newPayments.length > 0) {
      setPayments((prev) => [...newPayments, ...prev]);
    }
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

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Wizard do Locatário
  const submitPaymentAndInspection = (data: {
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
              data_pagamento: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );

    triggerBrowserNotification(
      "Seven Drive - Novo Pagamento Enviado",
      `O motorista enviou comprovante e vistoria (${data.kmRegistrado} km) para conferência.`
    );
  };

  // Dupla Checagem: Confirmar e Dar Baixa
  const confirmPaymentAndInspection = (paymentId: string, observation?: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: "confirmado",
              observacao_admin: observation || "Confirmado e baixado pelo Locador.",
              updated_at: new Date().toISOString(),
            }
          : p
      )
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

  const deleteMaintenance = (id: string) => {
    setMaintenances((prev) => prev.filter((m) => m.id !== id));
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

  const deleteFine = (id: string) => {
    setFines((prev) => prev.filter((f) => f.id !== id));
  };

  // Despesas
  const addExpense = (expData: Omit<Expense, "id" | "created_at">) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Configurações
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings, updated_at: new Date().toISOString() }));
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
