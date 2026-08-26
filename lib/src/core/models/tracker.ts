import { Point } from "../interfaces/point.interface";

export interface Tracker {
  id: string;
  position: Point;
  text: string;
  hidden: boolean;
}
