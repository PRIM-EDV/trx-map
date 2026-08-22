import { Tracker } from "../models/tracker";

export interface TrackerMouseEvent extends MouseEvent {
  tracker?: Tracker;
}
