import { IMainMarketGame } from '@/models/MainMarketGame';
import { IStarlineGame } from '@/models/StarlineGame';
import { IGalidisawarGame } from '@/models/GalidisawarGame';


export interface MainMarketState {
  games: IMainMarketGame[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
}

export interface StarlineGameState {
  games: IStarlineGame[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
}

export interface GalidisawarGameState {
  games: IGalidisawarGame[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalCount: number;
}