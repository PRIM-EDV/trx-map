import { Point } from "../interfaces/point.interface";

export interface Tracker {
  id: string;
  position: Point;
  hidden: boolean;
}
