import React from 'react';
import Svg, { Path, Rect, Circle, G, SvgProps, Polygon, Line } from 'react-native-svg';

interface OnboardingIconProps extends SvgProps {
    size?: number;
    color?: string;
}

/**
 * Professional Palette icon for "Generador de Prompts" feature
 * Replaces the 🎨 emoji
 */
export const PaletteIcon = ({ size = 24, color = "#8B5CF6", ...props }: OnboardingIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
        {/* Palette shape */}
        <Path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9z"
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Color dots */}
        <Circle cx="6.5" cy="11.5" r="1.5" fill={color} />
        <Circle cx="9.5" cy="7.5" r="1.5" fill={color} />
        <Circle cx="14.5" cy="7.5" r="1.5" fill={color} />
        <Circle cx="17.5" cy="11.5" r="1.5" fill={color} />
    </Svg>
);

/**
 * Professional Newspaper/Feed icon for "Noticias de IA" feature
 * Replaces the 📰 emoji
 */
export const FeedIcon = ({ size = 24, color = "#10B981", ...props }: OnboardingIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
        {/* Main newspaper shape */}
        <Path
            d="M4 4h12v16H6a2 2 0 01-2-2V4z"
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Side panel */}
        <Path
            d="M16 8h4v10a2 2 0 01-2 2h-2V8z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Headlines */}
        <Line x1="7" y1="8" x2="13" y2="8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1="7" y1="12" x2="13" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1="7" y1="16" x2="11" y2="16" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
);

/**
 * Professional Trophy icon for "Ranking de Modelos" feature
 * Replaces the 🏆 emoji
 */
export const TrophyIcon = ({ size = 24, color = "#F59E0B", ...props }: OnboardingIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
        {/* Main trophy cup */}
        <Path
            d="M8 21h8M12 17v4M17 4H7v7c0 2.761 2.239 5 5 5s5-2.239 5-5V4z"
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Left handle */}
        <Path
            d="M7 8H4a1 1 0 01-1-1V5a1 1 0 011-1h3"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Right handle */}
        <Path
            d="M17 8h3a1 1 0 001-1V5a1 1 0 00-1-1h-3"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Star decoration */}
        <Path
            d="M12 7l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 9.1l2-.3L12 7z"
            fill={color}
        />
    </Svg>
);

/**
 * Professional Rocket icon for the "Comenzar" button
 * Replaces the 🚀 emoji
 */
export const RocketIcon = ({ size = 24, color = "#FFFFFF", ...props }: OnboardingIconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
        {/* Rocket body */}
        <Path
            d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"
            fill={color}
            fillOpacity={0.3}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11.95A22 22 0 0112 15z"
            fill={color}
            fillOpacity={0.3}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Left fin */}
        <Path
            d="M9 12H4s.55-3.03 2-4.5C7.45 6.05 10 5.5 10 5.5"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Bottom fin */}
        <Path
            d="M12 15v5s3.03-.55 4.5-2c1.45-1.45 2-4.5 2-4.5"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        {/* Window/porthole */}
        <Circle cx="15" cy="9" r="2" stroke={color} strokeWidth={1.5} />
    </Svg>
);
