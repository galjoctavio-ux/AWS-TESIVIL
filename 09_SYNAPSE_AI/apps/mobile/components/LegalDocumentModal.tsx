import React from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { SPACING, RADIUS } from '@/constants/config';
import { Icon } from '@/components/icons/Icon';

// Legal document content - parsed from markdown files
const TERMS_CONTENT = {
    title: 'Términos y Condiciones de Uso',
    sections: [
        {
            heading: '1. Aceptación de los Términos',
            content: 'Al descargar, registrarse o utilizar la aplicación SYNAPSE AI (en adelante, la "Aplicación"), el usuario acepta de manera expresa e irrevocable los presentes Términos y Condiciones.\n\nSi el usuario no está de acuerdo, deberá abstenerse de utilizar la Aplicación.'
        },
        {
            heading: '2. Naturaleza del Servicio',
            content: 'La Aplicación es una herramienta tecnológica de apoyo que utiliza modelos de inteligencia artificial de terceros para generar:\n\n• Sugerencias y prompts\n• Resúmenes de noticias\n• Rankings y comparativas de modelos de IA\n• Contenido automatizado\n\nLa Aplicación no garantiza la exactitud, integridad, utilidad ni idoneidad de la información generada.'
        },
        {
            heading: '3. Uso de Inteligencia Artificial',
            content: 'El usuario reconoce y acepta que:\n\n• Los resultados generados por IA pueden ser incorrectos, incompletos, desactualizados u ofensivos.\n• La Aplicación no controla ni entrena los modelos de IA utilizados.\n• El uso de la información generada se realiza bajo su propio riesgo.\n\nLa Aplicación no será responsable por decisiones técnicas, comerciales, profesionales o personales tomadas con base en dichos resultados.'
        },
        {
            heading: '4. Propiedad Intelectual',
            content: '• El usuario conserva los derechos sobre los datos que ingresa.\n• Los prompts generados son sugerencias automatizadas sin carácter de obra protegida.\n• La Aplicación no es autora ni coautora de los resultados obtenidos en plataformas externas.'
        },
        {
            heading: '5. Contenido de Usuarios (Showcase)',
            content: 'El usuario declara y garantiza que:\n\n• Es titular de los derechos del contenido que publica.\n• El contenido no infringe derechos de terceros ni leyes aplicables.\n\nLa Aplicación actúa como intermediario neutral y podrá retirar contenido sin previo aviso.'
        },
        {
            heading: '6. Limitación de Responsabilidad',
            content: 'En ningún caso la Aplicación será responsable por:\n\n• Daños directos, indirectos, incidentales o consecuenciales\n• Pérdida de datos, beneficios o oportunidades\n• Derivados del uso o imposibilidad de uso del servicio'
        },
        {
            heading: '7. Terminación',
            content: 'La Aplicación podrá suspender o cancelar cuentas que incumplan estos Términos, sin previo aviso y sin derecho a indemnización.'
        },
        {
            heading: '8. Modificaciones',
            content: 'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en la Aplicación.'
        },
        {
            heading: '9. Jurisdicción',
            content: 'Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será resuelta ante los tribunales competentes de la Ciudad de México.'
        },
        {
            heading: '10. Contacto',
            content: 'Para dudas o aclaraciones sobre estos Términos:\n\nEmail: legal@tesivil.com'
        }
    ]
};

const PRIVACY_CONTENT = {
    title: 'Aviso de Privacidad Integral',
    sections: [
        {
            heading: '1. Responsable del Tratamiento',
            content: 'TESIVIL_STACK, representado por Tecnología y Software en la Ingeniería Civil, es responsable del tratamiento de los datos personales recabados a través de la aplicación SYNAPSE AI.'
        },
        {
            heading: '2. Datos Personales Recabados',
            content: 'Datos de Registro:\n• Nombre o alias\n• Correo electrónico\n• Foto de perfil (opcional)\n\nDatos de Uso:\n• Prompts generados\n• Historial de búsquedas\n• Proyectos publicados en Showcase\n• Comentarios e interacciones\n\nDatos Técnicos:\n• Identificador de dispositivo\n• Versión del sistema operativo\n• Datos de navegación y uso'
        },
        {
            heading: '3. Finalidades del Tratamiento',
            content: 'Finalidades Primarias (Necesarias):\n• Registro y autenticación de usuarios\n• Operación de los módulos de la Aplicación\n• Generación de prompts y contenido personalizado\n• Moderación de contenido\n\nFinalidades Secundarias (Opcionales):\n• Mejora del servicio y experiencia de usuario\n• Análisis estadístico y de comportamiento\n• Publicidad y monetización\n• Comunicaciones promocionales\n\nEl usuario puede oponerse a las finalidades secundarias mediante correo electrónico.'
        },
        {
            heading: '4. Transferencias de Datos',
            content: 'Sus datos personales podrán ser transferidos a:\n\n• Supabase (Estados Unidos) - Base de datos y autenticación\n• Google Cloud (Estados Unidos) - APIs de IA y analíticas\n• Amazon Web Services (Estados Unidos) - Hosting y almacenamiento\n• Groq / OpenAI (Estados Unidos) - Procesamiento de prompts\n\nEstas transferencias se realizan conforme a las leyes aplicables y con proveedores que mantienen medidas de seguridad adecuadas.'
        },
        {
            heading: '5. Derechos ARCO',
            content: 'El usuario tiene derecho a:\n\n• Acceder a sus datos personales\n• Rectificar datos inexactos\n• Cancelar el tratamiento\n• Oponerse al uso para fines específicos\n\nProcedimiento:\n1. Enviar solicitud a: privacy@tesivil.com\n2. Incluir: Nombre, correo registrado, descripción del derecho a ejercer\n3. Plazo de respuesta: 20 días hábiles'
        },
        {
            heading: '6. Medidas de Seguridad',
            content: 'Implementamos medidas técnicas y organizativas:\n\n• Cifrado de datos en tránsito (TLS/HTTPS)\n• Cifrado de datos en reposo\n• Control de acceso basado en roles\n• Monitoreo de seguridad\n• Respaldos automáticos'
        },
        {
            heading: '7. Uso de Cookies y Tecnologías',
            content: 'La Aplicación puede utilizar:\n\n• Almacenamiento local (AsyncStorage)\n• Tokens de sesión\n• Identificadores analíticos'
        },
        {
            heading: '8. Cambios al Aviso',
            content: 'Nos reservamos el derecho de modificar este Aviso. Las modificaciones serán notificadas a través de la Aplicación y entrarán en vigor desde su publicación.'
        },
        {
            heading: '9. Contacto',
            content: 'Para dudas, solicitudes ARCO o revocación del consentimiento:\n\nEmail: privacy@tesivil.com\nUbicación: Ciudad de México, México'
        },
        {
            heading: '10. Legislación Aplicable',
            content: 'Este Aviso se rige por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México y su Reglamento.'
        }
    ]
};

interface LegalDocumentModalProps {
    visible: boolean;
    onClose: () => void;
    type: 'terms' | 'privacy';
}

export function LegalDocumentModal({ visible, onClose, type }: LegalDocumentModalProps) {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{content.title}</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="X" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Document Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    <View style={styles.metaInfo}>
                        <Text style={styles.metaText}>Aplicación: SYNAPSE AI (TESIVIL_STACK)</Text>
                        <Text style={styles.metaText}>Jurisdicción: Estados Unidos Mexicanos</Text>
                        <Text style={styles.metaText}>Última actualización: Diciembre 2025</Text>
                    </View>

                    {content.sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.sectionHeading}>{section.heading}</Text>
                            <Text style={styles.sectionContent}>{section.content}</Text>
                        </View>
                    ))}

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={onClose}
                        >
                            <Text style={styles.acceptButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
        marginRight: SPACING.md,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    metaInfo: {
        backgroundColor: colors.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    metaText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: SPACING.sm,
    },
    sectionContent: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    footer: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
    },
    acceptButton: {
        backgroundColor: colors.primary,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LegalDocumentModal;
