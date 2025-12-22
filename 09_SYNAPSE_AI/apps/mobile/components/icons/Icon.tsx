import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
    Sparkles,
    Newspaper,
    BarChart3,
    Rocket,
    User,
    Cpu,
    FlaskConical,
    Wrench,
    Briefcase,
    LayoutGrid,
    Trophy,
    MessageSquare,
    Terminal,
    Palette,
    Music,
    Bot,
    Brain,
    Globe,
    Zap,
    Wind,
    MonitorSmartphone,
    LogIn,
    LogOut,
    Info,
    Crown,
    History,
    Settings,
    FileText,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    AlertTriangle,
    RefreshCw,
    Camera,
    AtSign,
    Edit2,
    Aperture,
    Circle,
    Plane,
    Lightbulb,
    Sun,
    Sunrise,
    Drama,
    Cloud,
    Wand2,
    GraduationCap,
    ThumbsUp,
    // News module icons
    Heart,
    MessageCircle,
    TrendingUp,
    ArrowRight,
    Eye,
    // Login
    Mail,
    Lock,
    EyeOff,
    ArrowLeft,
    type LucideIcon,
} from 'lucide-react-native';
import { COLORS } from '@/constants/config';

// Icon name to component mapping
const ICONS: Record<string, LucideIcon> = {
    // Tab Bar
    Sparkles,
    Newspaper,
    BarChart3,
    Rocket,
    User,
    GraduationCap,

    // Filters
    Cpu,
    FlaskConical,
    Wrench,
    Briefcase,
    LayoutGrid,
    Trophy,
    MessageSquare,
    Terminal,
    Palette,
    Music,

    // Tools
    Bot,
    Brain,
    Globe,
    Zap,
    Wind,
    MonitorSmartphone,

    // Profile Menu
    LogIn,
    LogOut,
    Crown,
    History,
    Settings,
    FileText,
    Info,
    AtSign,
    Edit2,

    // UI Elements
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    AlertTriangle,
    RefreshCw,
    ThumbsUp,

    // Engine params
    Camera,
    Aperture,
    Circle,
    Plane,
    Lightbulb,
    Sun,
    Sunrise,
    Drama,
    Cloud,
    Wand2,

    // News module
    Heart,
    MessageCircle,
    TrendingUp,
    ArrowRight,
    Eye,
    // Login
    Mail,
    Lock,
    EyeOff,
    ArrowLeft,
};

// Icon names type
export type IconName = keyof typeof ICONS;

interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    strokeWidth?: number;
    glow?: boolean;
    glowColor?: string;
    style?: StyleProp<ViewStyle>;
}

export function Icon({
    name,
    size = 24,
    color = COLORS.textPrimary,
    strokeWidth = 1.75,
    glow = false,
    glowColor,
    style,
}: IconProps) {
    const IconComponent = ICONS[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    const iconElement = (
        <IconComponent
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            style={style}
        />
    );

    if (glow) {
        return (
            <View style={[styles.glowContainer, { shadowColor: glowColor || color }]}>
                {iconElement}
            </View>
        );
    }

    return iconElement;
}

const styles = StyleSheet.create({
    glowContainer: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default Icon;
