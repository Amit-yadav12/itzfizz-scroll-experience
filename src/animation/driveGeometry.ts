import { driveDistanceProgress } from './driveMotion';

export const DRIVE_EDGE_OVERHANG = 0.24;

export interface DriveGeometry {
  viewportWidth: number;
  carWidth: number;
  startX: number;
  endX: number;
  distance: number;
  treadDistance: number;
}

export function calculateDriveGeometry(viewportWidth: number, carWidth: number): DriveGeometry {
  const width = Math.max(1, viewportWidth);
  const vehicle = Math.max(1, carWidth);
  const startX = -vehicle * DRIVE_EDGE_OVERHANG;
  const endX = width - vehicle * (1 - DRIVE_EDGE_OVERHANG);
  const distance = endX - startX;

  // Symmetric edges keep the midpoint centered even with acceleration/braking.
  return { viewportWidth: width, carWidth: vehicle, startX, endX, distance, treadDistance: distance / vehicle };
}

export function drivePositionAt(geometry: DriveGeometry, progress: number): number {
  return geometry.startX + geometry.distance * driveDistanceProgress(progress);
}