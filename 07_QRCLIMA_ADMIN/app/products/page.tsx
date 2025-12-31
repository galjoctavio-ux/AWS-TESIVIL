'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/auth-context';

interface DigitalBenefit {
    type: 'pro_days' | 'pdf_unlock' | 'token_boost' | 'course_unlock' | 'tokens_grant';
    value: number;
    durationDays?: number;
}

interface ProductVariant {
    id: string;
    name: string;
    stock: number;
}

interface StoreProduct {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    priceTokens: number | null;
    priceMXN: number | null;
    category: 'digital' | 'physical' | 'subscription';
    subcategory: string;
    stock: number;
    isActive: boolean;
    maxPerUser: number | null;
    cooldownDays: number | null;
    digitalBenefit?: DigitalBenefit;
    requiresShipping: boolean;
    variants?: ProductVariant[];
    sortOrder: number;
}

const categoryLabels: Record<string, string> = {
    digital: '🎁 Digital',
    physical: '🔧 Físico',
    subscription: '💳 Suscripción',
};

const subcategoryLabels: Record<string, string> = {
    pro_boost: 'PRO / Boost',
    pdf: 'PDFs',
    tools: 'Herramientas',
    merch: 'Merchandising',
    tokens: 'Tokens',
    course: 'Cursos',
};

const benefitTypeLabels: Record<string, string> = {
    pro_days: 'Días PRO',
    pdf_unlock: 'PDF Sin Marca',
    token_boost: 'Multiplicador Tokens',
    course_unlock: 'Desbloquear Curso',
    tokens_grant: 'Otorgar Tokens',
};

const emptyProduct: Partial<StoreProduct> = {
    name: '',
    description: '',
    imageUrl: '',
    priceTokens: null,
    priceMXN: null,
    category: 'digital',
    subcategory: 'pro_boost',
    stock: -1,
    isActive: true,
    maxPerUser: null,
    cooldownDays: null,
    requiresShipping: false,
    sortOrder: 0,
};

export default function ProductsPage() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Partial<StoreProduct> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'digital' | 'physical' | 'subscription'>('all');
    const { logout } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async () => {
        if (!selectedProduct?.name) {
            alert('El nombre es requerido');
            return;
        }

        try {
            setSaving(true);

            if (isCreating) {
                // Create new product
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(selectedProduct),
                });

                if (response.ok) {
                    alert('✅ Producto creado');
                    fetchProducts();
                    setSelectedProduct(null);
                    setIsCreating(false);
                }
            } else {
                // Update existing product
                const response = await fetch('/api/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: selectedProduct.id,
                        updates: selectedProduct,
                    }),
                });

                if (response.ok) {
                    alert('✅ Producto actualizado');
                    fetchProducts();
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('❌ Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`/api/products?id=${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('✅ Producto eliminado');
                fetchProducts();
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleToggleActive = async (product: StoreProduct) => {
        try {
            await fetch('/api/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    updates: { isActive: !product.isActive },
                }),
            });
            fetchProducts();
        } catch (error) {
            console.error('Error toggling product:', error);
        }
    };

    const filteredProducts = products.filter(p =>
        filter === 'all' || p.category === filter
    );

    const updateProduct = (field: string, value: any) => {
        setSelectedProduct(prev => prev ? { ...prev, [field]: value } : null);
    };

    const updateDigitalBenefit = (field: string, value: any) => {
        setSelectedProduct(prev => {
            if (!prev) return null;
            return {
                ...prev,
                digitalBenefit: {
                    ...(prev.digitalBenefit || { type: 'pro_days', value: 0 }),
                    [field]: value,
                },
            };
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar onLogout={logout} />

            <main className="lg:ml-64 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Gestión de Productos</h2>
                        <p className="text-slate-500 mt-1">Administrar catálogo de la tienda</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedProduct({ ...emptyProduct });
                            setIsCreating(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        ➕ Nuevo Producto
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: 'all', label: '📦 Todos' },
                        { key: 'digital', label: '🎁 Digitales' },
                        { key: 'physical', label: '🔧 Físicos' },
                        { key: 'subscription', label: '💳 Suscripciones' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products List */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-500">Cargando productos...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                <span className="text-4xl block mb-3">📦</span>
                                <p>No hay productos configurados</p>
                                <p className="text-sm mt-2">Haz clic en "Nuevo Producto" para crear el primero</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsCreating(false);
                                        }}
                                        className={`p-4 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between ${selectedProduct?.id === product.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                                                {product.category === 'digital' ? '🎁' :
                                                    product.category === 'physical' ? '🔧' : '💳'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{product.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {product.priceTokens ? `🪙 ${product.priceTokens}` : ''}
                                                    {product.priceTokens && product.priceMXN ? ' · ' : ''}
                                                    {product.priceMXN ? `$${product.priceMXN} MXN` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${product.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleActive(product);
                                                }}
                                                className="p-2 hover:bg-slate-200 rounded"
                                            >
                                                {product.isActive ? '🔴' : '🟢'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Editor */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        {selectedProduct ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <h3 className="font-bold text-lg text-slate-800">
                                        {isCreating ? '➕ Nuevo Producto' : '✏️ Editar Producto'}
                                    </h3>
                                    {!isCreating && (
                                        <button
                                            onClick={() => handleDeleteProduct(selectedProduct.id!)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    )}
                                </div>

                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        value={selectedProduct.name || ''}
                                        onChange={(e) => updateProduct('name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                        rows={2}
                                        value={selectedProduct.description || ''}
                                        onChange={(e) => updateProduct('description', e.target.value)}
                                    />
                                </div>

                                {/* Category */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Categoría</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            value={selectedProduct.category || 'digital'}
                                            onChange={(e) => updateProduct('category', e.target.value)}
                                        >
                                            <option value="digital">🎁 Digital</option>
                                            <option value="physical">🔧 Físico</option>
                                            <option value="subscription">💳 Suscripción</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Subcategoría</label>
                                        <select
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            value={selectedProduct.subcategory || 'pro_boost'}
                                            onChange={(e) => updateProduct('subcategory', e.target.value)}
                                        >
                                            <option value="pro_boost">PRO / Boost</option>
                                            <option value="pdf">PDFs</option>
                                            <option value="tools">Herramientas</option>
                                            <option value="merch">Merchandising</option>
                                            <option value="tokens">Tokens</option>
                                            <option value="course">Cursos</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">🪙 Precio Tokens</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            placeholder="null = no vender"
                                            value={selectedProduct.priceTokens ?? ''}
                                            onChange={(e) => updateProduct('priceTokens', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">💲 Precio MXN</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            placeholder="null = no vender"
                                            value={selectedProduct.priceMXN ?? ''}
                                            onChange={(e) => updateProduct('priceMXN', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                </div>

                                {/* Stock & Limits */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            placeholder="-1 = ∞"
                                            value={selectedProduct.stock ?? -1}
                                            onChange={(e) => updateProduct('stock', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Max/Usuario</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            placeholder="null = ∞"
                                            value={selectedProduct.maxPerUser ?? ''}
                                            onChange={(e) => updateProduct('maxPerUser', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Cooldown</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                            placeholder="días"
                                            value={selectedProduct.cooldownDays ?? ''}
                                            onChange={(e) => updateProduct('cooldownDays', e.target.value ? parseInt(e.target.value) : null)}
                                        />
                                    </div>
                                </div>

                                {/* Digital Benefit (for digital products) */}
                                {selectedProduct.category === 'digital' && (
                                    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                                        <p className="font-medium text-blue-800">🎁 Beneficio Digital</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-blue-600 mb-1">Tipo</label>
                                                <select
                                                    className="w-full px-2 py-1 border border-blue-200 rounded text-sm"
                                                    value={selectedProduct.digitalBenefit?.type || 'pro_days'}
                                                    onChange={(e) => updateDigitalBenefit('type', e.target.value)}
                                                >
                                                    <option value="pro_days">Días PRO</option>
                                                    <option value="pdf_unlock">PDF Sin Marca</option>
                                                    <option value="token_boost">Boost Tokens (1.5x)</option>
                                                    <option value="tokens_grant">Otorgar Tokens</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-blue-600 mb-1">Valor</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full px-2 py-1 border border-blue-200 rounded text-sm"
                                                    placeholder="días/cantidad"
                                                    value={selectedProduct.digitalBenefit?.value ?? ''}
                                                    onChange={(e) => updateDigitalBenefit('value', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                        {selectedProduct.digitalBenefit?.type === 'token_boost' && (
                                            <div>
                                                <label className="block text-xs text-blue-600 mb-1">Duración (días)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-2 py-1 border border-blue-200 rounded text-sm"
                                                    value={selectedProduct.digitalBenefit?.durationDays ?? ''}
                                                    onChange={(e) => updateDigitalBenefit('durationDays', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Physical product options */}
                                {selectedProduct.category === 'physical' && (
                                    <div className="p-4 bg-amber-50 rounded-lg">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedProduct.requiresShipping ?? true}
                                                onChange={(e) => updateProduct('requiresShipping', e.target.checked)}
                                            />
                                            <span className="text-amber-800">📦 Requiere envío (pedirá dirección)</span>
                                        </label>
                                    </div>
                                )}

                                {/* Active toggle */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm font-medium text-slate-600">Producto Activo</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedProduct.isActive ?? true}
                                            onChange={(e) => updateProduct('isActive', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveProduct}
                                    disabled={saving}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? '⏳ Guardando...' : '💾 Guardar Producto'}
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedProduct(null);
                                        setIsCreating(false);
                                    }}
                                    className="w-full py-2 text-slate-500 hover:text-slate-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <span className="text-4xl block mb-3">👈</span>
                                <p>Selecciona un producto para editar</p>
                                <p className="text-sm mt-2">o crea uno nuevo</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
