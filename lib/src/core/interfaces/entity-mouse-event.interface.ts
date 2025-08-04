import { Entity } from "../models/entity";

export interface EntityMouseEvent extends MouseEvent {
  entity?: Entity;
}