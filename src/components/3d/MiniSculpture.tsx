import React from 'react';
import { Cyber3DSystem } from './Cyber3DSystem';

export const MiniSculpture: React.FC<{ size?: number }> = ({ size = 140 }) => {
  return <Cyber3DSystem variant="minimal" height={size} />;
};
