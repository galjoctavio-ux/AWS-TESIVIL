import React from 'react';
import Svg, { Path, Rect, Circle, SvgProps } from 'react-native-svg';

interface EngineIconProps extends SvgProps {
    size?: number;
    color?: string;
}

export const MidjourneyIcon = ({ size = 24, color = "black", ...props }: EngineIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
        <Path d="M50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90Z" fill="white" stroke={color} strokeWidth="2" />
        <Path d="M30 45C30 45 40 30 50 30C60 30 70 45 70 45M30 55C30 55 40 70 50 70C60 70 70 55 70 55" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <Path d="M50 30V70" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </Svg>
);

export const DalleIcon = ({ size = 24, color = "black", ...props }: EngineIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
        <Rect x="10" y="10" width="80" height="80" rx="10" fill="white" stroke={color} strokeWidth="2" />
        <Rect x="25" y="25" width="20" height="20" rx="4" fill={color} />
        <Rect x="55" y="25" width="20" height="20" rx="4" fill={color} />
        <Rect x="25" y="55" width="50" height="10" rx="4" fill={color} />
    </Svg>
);

export const StableDiffusionIcon = ({ size = 24, color = "black", ...props }: EngineIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
        <Circle cx="50" cy="50" r="40" fill="white" stroke={color} strokeWidth="4" />
        <Path d="M50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20Z" stroke={color} strokeWidth="2" />
        <Path d="M50 35C58.2843 35 65 41.7157 65 50C65 58.2843 58.2843 65 50 65C41.7157 65 35 58.2843 35 50C35 41.7157 41.7157 35 50 35Z" fill={color} />
    </Svg>
);

export const FluxIcon = ({ size = 24, color = "black", ...props }: EngineIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
        <Path d="M10 10H90V90H10V10Z" fill="white" stroke={color} strokeWidth="2" />
        <Path d="M50 20L80 50L50 80L20 50L50 20Z" fill={color} />
        <Path d="M50 35L65 50L50 65L35 50L50 35Z" fill="white" />
    </Svg>
);
