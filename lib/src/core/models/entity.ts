import { Point } from "../interfaces/point.interface";

export enum EntityType { 
    UNDEFINED = 0,
    FOE = 1,
    FRIEND = 2,
    OBJECT = 3,
} 

export enum EntityState {
    UNDEFINED = 0,
    NORMAL = 1,
    BATTLE = 2,
}

export interface Entity {
  id: string;
  position: Point;
  type: EntityType;
  size: number;
  text: string;

  state: EntityState;
  symbol: number
}
