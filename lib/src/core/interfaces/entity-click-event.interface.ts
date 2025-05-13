import { Entity } from "../models/entity";

export interface EntityClickEvent extends MouseEvent {
  entity: Entity;
}