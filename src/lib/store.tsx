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
  tipo: "atencao" | "urgente"; // atencao (amarelo: <= 1000km), urgente (vermelho: <= 500km)
  mensagem: string;
}

interface SevenDriveContextType {
  currentUser: Profile;
  setCurrentUser: (user: Profile) => void;
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

  // Contratos
  addContract: (contract: Omit<Contract, "id" | "created_at" | "updated_at">) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;

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

  // Multas & Despesas
  addFine: (fine: Omit<Fine, "id" | "created_at">) => void;
  updateFine: (id: string, updates: Partial<Fine>) => void;
  addExpense: (expense: Omit<Expense, "id" | "created_at">) => void;

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
  const [currentUser, setCurrentUser] = useState<Profile>(initialProfiles[0]); // Padrão: Admin
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

  // Carrega do localStorage no client para persistência local
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVehicles = localStorage.getItem("sevendrive_vehicles");
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
      const savedPayments = localStorage.getItem("sevendrive_payments");
      if (savedPayments) setPayments(JSON.parse(savedPayments));
      const savedInspections = localStorage.getItem("sevendrive_inspections");
      if (savedInspections) setInspections(JSON.parse(savedInspections));
    }
  }, []);

  // Salva no localStorage quando alterado
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sevendrive_vehicles", JSON.stringify(vehicles));
      localStorage.setItem("sevendrive_payments", JSON.stringify(payments));
      localStorage.setItem("sevendrive_inspections", JSON.stringify(inspections));
    }
  }, [vehicles, payments, inspections]);

  // Cálculo Dinâmico de Alertas Duplos de Manutenção por KM
  useEffect(() => {
    const alerts: AlertItem[] = [];

    vehicles.forEach((veh) => {
      maintenanceRules.forEach((rule) => {
        if (!rule.ativo) return;

        // Encontra a última manutenção realizada deste item para este veículo
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
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/icons/badge-72.png",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  // Veículos
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

  // Contratos
  const addContract = (contractData: Omit<Contract, "id" | "created_at" | "updated_at">) => {
    const newContract: Contract = {
      ...contractData,
      id: `cont-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setContracts((prev) => [newContract, ...prev]);
    // Atualiza status do veículo para alugado
    updateVehicle(contractData.vehicle_id, { status: "alugado" });
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c))
    );
  };

  // Pagamentos (Controle Total Admin)
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

  // Wizard de 3 Etapas do Locatário
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

    // 1. Criar registro de vistoria
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

    // 2. Mudar status do pagamento para pendente_conferencia
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

    // Dispara alerta nativo
    triggerBrowserNotification(
      "Seven Drive - Novo Pagamento Enviado",
      `O motorista enviou comprovante e vistoria (${data.kmRegistrado} km) para conferência.`
    );
  };

  // Dupla Checagem: Confirmar e Dar Baixa (Portal do Locador)
  const confirmPaymentAndInspection = (paymentId: string, observation?: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    // 1. Atualizar pagamento para confirmado
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

    // 2. Atualizar inspeção para aprovada e pegar o KM registrado
    const inspection = inspections.find((i) => i.payment_id === paymentId);
    if (inspection) {
      setInspections((prev) =>
        prev.map((i) => (i.id === inspection.id ? { ...i, status_conferencia: "aprovada" } : i))
      );

      // 3. Atualizar o KM oficial do veículo no sistema!
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

    // Se a manutenção tiver KM maior ou recente, pode atualizar o KM do veículo
    if (maintData.km_realizado) {
      const veh = vehicles.find((v) => v.id === maintData.vehicle_id);
      if (veh && maintData.km_realizado > veh.km_atual) {
        updateVehicle(veh.id, { km_atual: maintData.km_realizado });
      }
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

  // Despesas
  const addExpense = (expData: Omit<Expense, "id" | "created_at">) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  // Configurações
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings, updated_at: new Date().toISOString() }));
  };

  // Saldo Líquido Consolidado
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
        addContract,
        updateContract,
        addPayment,
        updatePayment,
        deletePayment,
        confirmPaymentAndInspection,
        submitPaymentAndInspection,
        addMaintenanceRule,
        updateMaintenanceRule,
        addMaintenance,
        addFine,
        updateFine,
        addExpense,
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
