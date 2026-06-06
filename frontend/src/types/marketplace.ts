export type ItemKind = "PRODUTO" | "RESIDUO";
export type OrderStatus = "PENDENTE" | "PROCESSANDO" | "CONCLUIDO" | "CANCELADO";
export type SolicitationStatus = "ENVIADA" | "ACEITA" | "RECUSADA";
export type ListingStatus = "DISPONIVEL" | "EM_NEGOCIACAO" | "VENDIDO" | "INATIVO";

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ProducerSummary {
  id: string;
  user?: SimpleUser;
}

export interface Listing {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  status: ListingStatus;
  verified?: boolean;
  producer?: ProducerSummary;
}

export interface Order {
  id: string;
  requesterType: string;
  itemKind: ItemKind;
  itemName: string;
  quantity: number;
  unit: string;
  status: OrderStatus;
  notes?: string | null;
  requester?: SimpleUser;
  assignedProducer?: ProducerSummary | null;
  createdAt: string;
}

export interface MatchResult {
  listingId: string;
  itemKind: ItemKind;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  producerId: string;
  producerName: string;
  producerEmail: string;
}

export interface Solicitation {
  id: string;
  status: SolicitationStatus;
  quantity: number;
  message?: string | null;
  responseMessage?: string | null;
  createdAt: string;
  order: Order;
  product?: Listing | null;
  residue?: Listing | null;
}
