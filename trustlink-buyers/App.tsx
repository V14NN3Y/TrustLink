import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, Platform, Dimensions, Alert, Switch, KeyboardAvoidingView, PanResponder, ActivityIndicator } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Mock simple pour react-native-maps pour éviter les crashs sur Fedora/Web (RNMapsAirModule)
const MapView = (props: any) => <View {...props}>{props.children}</View>;
const Marker = (_props: any) => <View />;

const { width } = Dimensions.get('window');

const THEME = {
  primary: '#125C8D', // Bleu principal TrustLink
  primaryDark: '#0E3A4F', // Bleu foncé
  primaryLight: '#EFF6FF',
  danger: '#DC2626',
  background: '#F9FAFB',
  backgroundSecondary: '#D9D9D0', // Gris clair
  white: '#FFFFFF',
  text: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  accent: '#FF6A00', // Orange CTA
};

const CATEGORIES = [
  { id: '1', name: 'Mode', icon: 'shirt-outline' },
  { id: '2', name: 'Beauté', icon: 'sparkles-outline' },
  { id: '3', name: 'High-Tech', icon: 'laptop-outline' },
  { id: '4', name: 'Auto', icon: 'car-outline' },
  { id: '5', name: 'Maison', icon: 'home-outline' },
  { id: '6', name: 'Sport', icon: 'basketball-outline' },
];

import { supabase } from './supabase';

const ENABLE_NATIVE_MAPS = false; // Désactiver pour éviter les crashs sur Fedora/Web (RNMapsAirModule)

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoadingProducts(false);
    }
    fetchProducts();
    fetchUserOrders();
  }, []);

  async function fetchUserOrders() {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(*)
        )
      `)
      .eq('client_id', '8093db71-155e-4050-8451-9ca79d85f55e') // Current Demo User
      .order('created_at', { ascending: false });

    if (!error) {
      setUserOrders(data || []);
    }
    setLoadingOrders(false);
  }

  const getStatusLabel = (status: string) => {
    const mapping: any = {
      'PENDING': 'En attente',
      'FUNDED': 'Payé (Escrow)',
      'INSPECTED': 'Inspecté (Lagos)',
      'SHIPPED': 'Expédié',
      'ARRIVED_AT_HUB': 'Reçu au Hub',
      'DELIVERED': 'Livré',
      'DISPUTED': 'Litige'
    };
    return mapping[status] || status;
  };

  const getFilteredOrders = () => {
    if (activeOrderTab === 'ALL') return userOrders;
    if (activeOrderTab === 'TO_PAY') return userOrders.filter(o => o.status === 'PENDING');
    if (activeOrderTab === 'PROCESSING') return userOrders.filter(o => ['FUNDED', 'INSPECTED'].includes(o.status));
    if (activeOrderTab === 'SHIPPED') return userOrders.filter(o => ['SHIPPED', 'ARRIVED_AT_HUB'].includes(o.status));
    if (activeOrderTab === 'DISPUTES') return userOrders.filter(o => o.status === 'DISPUTED');
    return userOrders;
  };
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  const [activeTab, setActiveTab] = useState<'HOME' | 'CART' | 'PROFILE'>('HOME');
  const [currentScreen, setCurrentScreen] = useState<'MAIN' | 'PRODUCT_DETAIL' | 'ADDRESS' | 'INVOICE' | 'PAYMENT_SUCCESS' | 'WISHLIST' | 'RETURN_POLICY' | 'ORDERS' | 'NOTIFICATIONS' | 'SETTINGS' | 'HELP' | 'PRIVACY' | 'MESSAGES'>('MAIN');
  const [activeOrderTab, setActiveOrderTab] = useState<'ALL' | 'TO_PAY' | 'PROCESSING' | 'SHIPPED' | 'DISPUTES'>('ALL');
  
  const [userMessages, setUserMessages] = useState<any[]>([
    { id: 1, text: "Bonjour, j'ai une question sur ma livraison.", sender: 'user', time: '10:30' },
    { id: 2, text: "Bonjour ! Comment pouvons-nous vous aider ?", sender: 'admin', time: '10:32' },
  ]);
  const [messageInput, setMessageInput] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('Tout');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Invoice state
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [address, setAddress] = useState({
    fullName: 'John Doe',
    phone: '01 23 45 67',
    city: 'Cotonou',
    street: 'Akpakpa, Rue 12',
    lat: 6.36536,
    lng: 2.43333,
  });

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire pour placer un marqueur précis.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setAddress(prev => ({
      ...prev,
      lat: location.coords.latitude,
      lng: location.coords.longitude
    }));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger if we are starting from the left edge and swiping right
        return currentScreen !== 'MAIN' && gestureState.dx > 40 && Math.abs(gestureState.dy) < 30 && gestureState.x0 < 50;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          goHome();
        }
      },
    })
  ).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('Home');

  const SECTIONS = ['All', 'Women', 'Curve', 'Kids', 'Men', 'Home'];


  if (!fontsLoaded) { return null; }

  const goHome = () => {
    setCurrentScreen('MAIN');
    setActiveTab('HOME');
    setSelectedProduct(null);
    setSearchQuery('');
    fetchUserOrders(); // Refresh orders when going home/mooving around
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Se déconnecter", onPress: () => {
          clearCart();
          goHome();
          alert("Vous avez été déconnecté.");
        }, style: "destructive" }
      ]
    );
  };

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors?.[0] || 'Standard');
    setSelectedSize(product.sizes?.[0] || 'Standard');
    setCurrentScreen('PRODUCT_DETAIL');
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('Veuillez sélectionner une taille et une couleur');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.product.id === selectedProduct.id && i.color === selectedColor && i.size === selectedSize);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, qty: i.qty + 1 } : i);
      }
      const item = { product: selectedProduct, color: selectedColor, size: selectedSize, qty: 1, id: Date.now().toString() };
      return [...prev, item];
    });
    alert('Ajouté au panier avec succès !');
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => {
      // Allow it to drop to 0, and then filter it out simulating deletion
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const removeCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setCurrentScreen('ADDRESS');
  };

  const calculateInvoice = () => {
    const subtotal = cart.reduce((sum, item) => sum + ((item.product.final_price_cfa || 0) * item.qty), 0);
    const taxes = subtotal * 0.18; // 18% TVA approx
    const commission = subtotal * 0.05; // 5% TrustLink fee
    const shipping = cart.length > 0 ? 5000 : 0; // Flat 5000 CFA for demo
    const total = subtotal + taxes + commission + shipping;
    return { subtotal, taxes, commission, shipping, total };
  };

  const handleFinalizePayment = async () => {
    if (cart.length === 0) return;
    setLoadingProducts(true); // Reuse loading state for simplicity or add a new one
    
    const invoice = calculateInvoice();
    
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: '8093db71-155e-4050-8451-9ca79d85f55e', // Placeholder Client ID
        total_cfa: invoice.total,
        status: 'PENDING',
        payment_reference: 'DEMO-' + Math.random().toString(36).substring(7).toUpperCase(),
        lat: address.lat,
        lng: address.lng
      })
      .select()
      .single();

    if (orderError) {
      alert('Erreur commande: ' + orderError.message);
      setLoadingProducts(false);
      return;
    }

    // 2. Create Order Items
    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.qty,
      price_cfa: item.product.final_price_cfa
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      alert('Erreur détails: ' + itemsError.message);
    } else {
      clearCart();
      setCurrentScreen('PAYMENT_SUCCESS');
    }
    
    setLoadingProducts(false);
  };

  const renderHomeMain = () => {
    return (
      <View style={styles.tabContent}>
        {/* Shein-Style Header: Large logo left, search right */}
        <View style={styles.sheinHeader}>
          <Image source={require('./assets/trustlink_logo.png')} style={styles.logoImageLarge} resizeMode="contain" />
          <View style={styles.sheinSearchBox}>
            <Ionicons name="search-outline" size={18} color={THEME.textGray} />
            <TextInput 
              style={styles.sheinSearchInput} 
              placeholder="Rechercher sur TrustLink..." 
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={THEME.textGray} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={{marginLeft: 12}} onPress={() => setCurrentScreen('NOTIFICATIONS')}>
            <Ionicons name="notifications-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
        </View>

        {/* Search Results View */}
        {searchQuery.length > 0 ? (
          <View style={{flex: 1, backgroundColor: THEME.background}}>
            {/* Results header */}
            <View style={{paddingHorizontal: 16, paddingVertical: 12, backgroundColor: THEME.white, borderBottomWidth: 1, borderBottomColor: THEME.border}}>
              <Text style={{fontFamily: 'Poppins-Bold', fontSize: 14, color: THEME.text}}>
                {products.filter(p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} résultat(s) pour "{searchQuery}"
              </Text>
            </View>
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
              {(() => {
                const results = products.filter(p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (results.length === 0) {
                  return (
                    <View style={{alignItems: 'center', paddingTop: 60, paddingHorizontal: 32}}>
                      <Ionicons name="search-outline" size={64} color={THEME.border} />
                      <Text style={{fontFamily: 'Poppins-Bold', fontSize: 18, color: THEME.text, marginTop: 16, textAlign: 'center'}}>Aucun résultat trouvé</Text>
                      <Text style={{color: THEME.textGray, textAlign: 'center', marginTop: 8, lineHeight: 22}}>Essayez un autre mot-clé (ex: "Robe", "High-Tech", "Sport")</Text>
                      <TouchableOpacity
                        style={{marginTop: 24, backgroundColor: THEME.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8}}
                        onPress={() => setSearchQuery('')}
                      >
                        <Text style={{color: 'white', fontFamily: 'Poppins-Bold'}}>Réinitialiser</Text>
                      </TouchableOpacity>
                      <Text style={{fontFamily: 'Poppins-Bold', fontSize: 15, color: THEME.text, marginTop: 40, alignSelf: 'flex-start'}}>Vous pourriez aimer</Text>
                      <View style={styles.gridContainer}>
                        {products.slice(0, 4).map(p => (
                          <TouchableOpacity key={p.id} style={styles.gridItem} onPress={() => { setSearchQuery(''); handleProductPress(p); }}>
                            <View style={styles.productCard}>
                              <Image source={{uri: p.images[0]}} style={styles.productImage} />
                              <View style={{padding: 8}}>
                                <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                                <Text style={styles.productPrice}>{p.price.toLocaleString('fr-FR')} CFA</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                }
                return (
                  <View style={styles.gridContainer}>
                    {results.map((p, idx) => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.gridItem}
                        activeOpacity={0.9}
                        onPress={() => { setSearchQuery(''); handleProductPress(p); }}
                      >
                        <View style={styles.productCard}>
                          <View style={{position: 'relative'}}>
                            <Image source={{uri: p.images[0]}} style={styles.productImage} />
                            <TouchableOpacity
                              style={styles.wishlistIcon}
                              onPress={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                            >
                              <Ionicons
                                name={wishlist.includes(p.id) ? 'heart' : 'heart-outline'}
                                size={20}
                                color={wishlist.includes(p.id) ? THEME.danger : THEME.textGray}
                              />
                            </TouchableOpacity>
                          </View>
                          <View style={{padding: 8}}>
                            <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                            <Text style={styles.productPrice}>{p.price.toLocaleString('fr-FR')} CFA</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                              <Text style={{fontSize: 10, color: '#F59E0B'}}>★ {p.rating}</Text>
                              <Text style={{fontSize: 10, color: THEME.textGray, marginLeft: 6}}>{p.sold} vendus</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })()}
              <View style={{height: 100}} />
            </ScrollView>
          </View>
        ) : (
          <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
            {/* Updated Categories UI - Pill Shape for better design */}
            <View style={{backgroundColor: THEME.white, paddingVertical: 12}}>
              <Text style={{paddingHorizontal: 16, fontSize: 16, fontFamily: 'Poppins-Bold', marginBottom: 12}}>Catégories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft: 16}}>
                <TouchableOpacity 
                    style={[styles.pillCategory, activeCategory === 'Tout' && styles.pillCategoryActive, {flexDirection: 'row', alignItems: 'center'}]} 
                    onPress={() => setActiveCategory('Tout')}
                >
                    <Ionicons name="apps-outline" size={16} color={activeCategory === 'Tout' ? THEME.white : THEME.accent} style={{marginRight: 6}} />
                    <Text style={activeCategory === 'Tout' ? styles.pillCategoryTextActive : styles.pillCategoryText}>Tout voir</Text>
                </TouchableOpacity>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.pillCategory, activeCategory === cat.name && styles.pillCategoryActive, {flexDirection: 'row', alignItems: 'center'}]} 
                    onPress={() => setActiveCategory(cat.name)}
                  >
                    <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.name ? THEME.white : THEME.accent} style={{marginRight: 6}} />
                    <Text style={activeCategory === cat.name ? styles.pillCategoryTextActive : styles.pillCategoryText}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Hero Banner - Ventes Flash (conditional) */}
            <View style={{width: '100%', height: 160, backgroundColor: '#0E3A4F', padding: 20, justifyContent: 'center'}}>
               <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                 <Ionicons name="flash" size={28} color={THEME.accent} style={{marginRight: 8}} />
                 <Text style={{color: THEME.white, fontSize: 28, fontStyle: 'italic', fontFamily: 'Poppins-Bold'}}>VENTES FLASH</Text>
               </View>
               <Text style={{color: THEME.white, opacity: 0.9, fontSize: 14, fontFamily: 'Poppins-Bold'}}>Jusqu'à -50% • Livraison Express Escrow</Text>
               <TouchableOpacity style={{backgroundColor: THEME.accent, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 12, flexDirection: 'row', alignItems: 'center'}}>
                  <Ionicons name="arrow-forward-outline" size={12} color={THEME.white} style={{marginRight: 4}} />
                  <Text style={{color: THEME.white, fontFamily: 'Poppins-Bold', fontSize: 12}}>DÉCOUVRIR</Text>
               </TouchableOpacity>
            </View>

            {/* Section Title */}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10, alignItems: 'center'}}>
               <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold', color: THEME.text}}>
                 {activeCategory === 'Tout' ? 'Recommandé pour vous' : `Meilleures ventes: ${activeCategory}`}
               </Text>
               <Text style={{color: THEME.primary, fontSize: 13, fontFamily: 'Poppins-Bold'}}>Voir tout &gt;</Text>
            </View>

            {/* Masonry-like Grid */}
            <View style={styles.gridContainer}>
              {products.filter(p => activeCategory === 'Tout' || p.category === activeCategory || (activeCategory === 'Mode' && (p.category === 'Mode & Beauté'))).map((p, idx) => (
                <TouchableOpacity key={p.id} style={styles.gridItem} activeOpacity={0.9} onPress={() => handleProductPress(p)}>
                  <View style={styles.productCard}>
                    <View style={{position: 'relative'}}>
                      {/* Badge Exclusif */}
                      {idx === 0 && <View style={styles.tagBadge}><Text style={{color: 'white', fontSize: 10, fontFamily: 'Poppins-Bold'}}>EXCLUSIF</Text></View>}
                      <Image source={{uri: p.images?.[0] || 'https://via.placeholder.com/600'}} style={styles.productImage} />
                      <TouchableOpacity 
                        style={styles.wishlistIcon} 
                        onPress={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                      >
                        <Ionicons 
                          name={wishlist.includes(p.id) ? "heart" : "heart-outline"} 
                          size={20} 
                          color={wishlist.includes(p.id) ? THEME.danger : THEME.textGray} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{padding: 8}}>
                      <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                        <Text style={styles.productPrice}>{(p.final_price_cfa || 0).toLocaleString('fr-FR')} CFA</Text>
                        {(p.discount_percent || 0) > 0 && (
                          <Text style={{fontSize: 10, color: THEME.textGray, textDecorationLine: 'line-through', marginLeft: 6}}>
                            {(p.base_price_cfa || 0).toLocaleString('fr-FR')} CFA
                          </Text>
                        )}
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                         {(p.discount_percent || 0) > 0 && (
                           <View style={{backgroundColor: THEME.danger, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, marginRight: 6}}>
                             <Text style={{color: 'white', fontSize: 9, fontFamily: 'Poppins-Bold'}}>-{p.discount_percent}%</Text>
                           </View>
                         )}
                        <Text style={{fontSize: 10, color: '#F59E0B'}}>★ {p.rating || 5.0}</Text>
                        <Text style={{fontSize: 10, color: THEME.textGray, marginLeft: 6}}>{p.sold || '0'} vendus</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{height: 100}} />
          </ScrollView>
        )}
      </View>
    );
  };

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <View style={styles.tabContent}>
        {/* Header Back */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8, zIndex: 10}}>
            <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {setCurrentScreen('MAIN'); setActiveTab('CART');}} style={{padding: 8, zIndex: 10, position: 'relative'}}>
            <Ionicons name="cart-outline" size={24} color={THEME.text} />
            {cart.length > 0 && <View style={styles.cartBadgeAbs}><Text style={{color: 'white', fontSize: 10, fontFamily: 'Poppins-Bold'}}>{cart.reduce((s,i)=>s+i.qty,0)}</Text></View>}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainScroll} bounces={false}>
          {/* Main Image - Dynamic Based on Color */}
          <View style={{position: 'relative'}}>
            <Image 
              source={{uri: (selectedProduct.colorImages && selectedColor && selectedProduct.colorImages[selectedColor]) || selectedProduct.images?.[0] || 'https://via.placeholder.com/600'}} 
              style={{width: '100%', height: 450, backgroundColor: '#F3F4F6'}} 
              resizeMode="cover" 
            />
            {(selectedProduct.discount_percent || 0) > 0 && (
              <View style={[styles.tagBadge, {backgroundColor: THEME.danger, borderBottomRightRadius: 12, top: 0, left: 0, paddingHorizontal: 12, paddingVertical: 8}]}>
                <Text style={{color: THEME.white, fontFamily: 'Poppins-Bold', fontSize: 18}}>-{selectedProduct.discount_percent}%</Text>
              </View>
            )}
          </View>

          {/* Price & Name Box */}
          <View style={{backgroundColor: THEME.white, padding: 16}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                  <Text style={{fontSize: 24, fontFamily: 'Poppins-Bold', color: THEME.danger, marginBottom: 8}}>
                    {(selectedProduct.final_price_cfa || 0).toLocaleString()} CFA
                  </Text>
                  {(selectedProduct.base_price_cfa || 0) > (selectedProduct.final_price_cfa || 0) && (
                    <Text style={{fontSize: 14, color: THEME.textGray, textDecorationLine: 'line-through', marginLeft: 10}}>
                      {selectedProduct.base_price_cfa.toLocaleString()} CFA
                    </Text>
                  )}
                </View>
                <Text style={{fontSize: 16, color: THEME.text, lineHeight: 22, fontFamily: 'Inter-Medium'}}>
                  {selectedProduct.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleWishlist(selectedProduct.id)} style={{padding: 8}}>
                <Ionicons 
                  name={wishlist.includes(selectedProduct.id) ? "heart" : "heart-outline"} 
                  size={28} 
                  color={wishlist.includes(selectedProduct.id) ? THEME.danger : THEME.textGray} 
                />
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 12}}>
              <Text style={{fontSize: 14, color: '#F59E0B', fontFamily: 'Poppins-Bold'}}>★ {selectedProduct.rating}</Text>
              <Text style={{fontSize: 14, color: THEME.textGray, marginLeft: 8}}>({selectedProduct.reviews} Avis) | {selectedProduct.sold} vendus</Text>
            </View>
          </View>

          {/* Options: Color */}
          <View style={{backgroundColor: THEME.white, marginTop: 8, padding: 16}}>
             <Text style={{fontSize: 15, fontFamily: 'Poppins-Bold', marginBottom: 12}}>Couleur: {selectedColor}</Text>
             <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
               {selectedProduct.colors.map((c: string) => (
                 <TouchableOpacity 
                   key={c} 
                   onPress={() => setSelectedColor(c)}
                   style={[styles.chip, selectedColor === c && styles.chipActive]}
                 >
                   <Text style={[styles.chipText, selectedColor === c && styles.chipTextActive]}>{c}</Text>
                 </TouchableOpacity>
               ))}
             </View>
          </View>

           {/* Options: Size */}
           <View style={{backgroundColor: THEME.white, marginTop: 1, padding: 16}}>
             <Text style={{fontSize: 15, fontFamily: 'Poppins-Bold', marginBottom: 12}}>Taille / Variante: {selectedSize}</Text>
             <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
               {selectedProduct.sizes.map((s: string) => (
                 <TouchableOpacity 
                   key={s} 
                   onPress={() => setSelectedSize(s)}
                   style={[styles.chip, selectedSize === s && styles.chipActive]}
                 >
                   <Text style={[styles.chipText, selectedSize === s && styles.chipTextActive]}>{s}</Text>
                 </TouchableOpacity>
               ))}
             </View>
          </View>

          {/* TrustLink Guarantees */}
          <View style={{backgroundColor: THEME.white, marginTop: 8, padding: 16}}>
            <Text style={{fontSize: 14, fontFamily: 'Poppins-Bold', marginBottom: 12}}>Garanties exclusives TrustLink</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
              <Ionicons name="shield-checkmark-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
              <Text style={{color: THEME.textGray, fontSize: 13}}>Fonds bloqués par FedaPay jusqu'à validation</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
              <Ionicons name="cube-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
              <Text style={{color: THEME.textGray, fontSize: 13}}>Vidéo d'inspection obligatoire au hub de Lagos</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="airplane-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
              <Text style={{color: THEME.textGray, fontSize: 13}}>Expédition sécurisée vers Cotonou en 48h</Text>
            </View>
          </View>

          {/* Reviews */}
          <View style={{backgroundColor: THEME.white, marginTop: 8, padding: 16, paddingBottom: 40}}>
            <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold', marginBottom: 16}}>Avis des clients ({selectedProduct.reviews})</Text>
            {selectedProduct.comments.length === 0 ? (
              <Text style={{color: THEME.textGray}}>Aucun avis écrit pour le moment.</Text>
            ) : (
              selectedProduct.comments.map((comment: any, idx: number) => (
                <View key={idx} style={{marginBottom: 16, borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 16}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
                    <Text style={{fontSize: 13, color: THEME.textGray}}>{comment.user}</Text>
                    <Text style={{fontSize: 12, color: THEME.textGray}}>{comment.date}</Text>
                  </View>
                  <Text style={{color: THEME.accent, fontSize: 12, marginBottom: 6}}>{"★".repeat(comment.rating)}</Text>
                  <Text style={{fontSize: 14, color: THEME.text, lineHeight: 20}}>{comment.text}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Buy Bar */}
        <View style={styles.fixedBottomNav}>
          <TouchableOpacity 
            style={{justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16}}
            onPress={() => {setCurrentScreen('MAIN'); setActiveTab('HOME');}}
          >
            <Ionicons name="storefront-outline" size={24} color={THEME.text} />
            <Text style={{fontSize: 10, marginTop: 4, fontFamily: 'Inter-Medium'}}>Boutique</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sheinBuyButton, {backgroundColor: THEME.accent}]} onPress={handleAddToCart}>
            <Text style={styles.sheinBuyButtonText}>AJOUTER AU PANIER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCartTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sheinHeaderCart}>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold', color: THEME.text}}>Panier ({cart.length})</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={{position: 'absolute', right: 16}}>
            <Text style={{color: THEME.textGray, fontSize: 12, fontFamily: 'Poppins-Bold'}}>VIDER</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {cart.length === 0 ? (
        <ScrollView style={{flex: 1, backgroundColor: THEME.background}} contentContainerStyle={{alignItems: 'center'}}>
          {/* Empty Cart Banner */}
          <View style={{padding: 40, alignItems: 'center', width: '100%', backgroundColor: THEME.white, marginBottom: 8}}>
            <Image 
              source={{uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png'}} 
              style={{width: 120, height: 120, opacity: 0.3, marginBottom: 20}} 
            />
            <Text style={{fontSize: 18, color: THEME.text, fontFamily: 'Poppins-Bold', marginBottom: 8}}>Votre panier est vide</Text>
            <Text style={{fontSize: 14, color: THEME.textGray, marginBottom: 24, textAlign: 'center'}}>Trouvez des produits pas chers en un clic !</Text>
            <TouchableOpacity style={[styles.sheinBuyButton, {backgroundColor: THEME.accent, paddingHorizontal: 30, width: '80%', marginLeft: 0}]} onPress={() => setActiveTab('HOME')}>
              <Text style={styles.sheinBuyButtonText}>DÉCOUVRIR LA BOUTIQUE</Text>
            </TouchableOpacity>
          </View>
          
          {/* Recommended products when empty */}
          <View style={{width: '100%'}}>
            <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold', margin: 16}}>Vous pourriez aimer</Text>
            <View style={styles.gridContainer}>
              {products.slice(0, 4).map(p => (
                <TouchableOpacity key={p.id} style={styles.gridItem} onPress={() => handleProductPress(p)}>
                  <View style={styles.productCard}>
                    <Image source={{uri: p.images?.[0] || 'https://via.placeholder.com/300'}} style={styles.productImage} />
                    {(p.discount_percent || 0) > 0 && (
                      <View style={[styles.tagBadge, {backgroundColor: THEME.danger, borderBottomRightRadius: 8, top: 0, left: 0, paddingHorizontal: 10, paddingVertical: 6}]}>
                        <Text style={{color: THEME.white, fontFamily: 'Poppins-Bold', fontSize: 14}}>-{p.discount_percent}%</Text>
                      </View>
                    )}
                    <TouchableOpacity style={styles.wishlistIcon} onPress={() => toggleWishlist(p.id)}>
                      <Ionicons name={wishlist.includes(p.id) ? "heart" : "heart-outline"} size={18} color={wishlist.includes(p.id) ? THEME.danger : THEME.text} />
                    </TouchableOpacity>
                    <View style={{padding: 8}}>
                      <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap'}}>
                        <Text style={styles.productPrice}>{(p.final_price_cfa || 0).toLocaleString()} CFA</Text>
                        {(p.base_price_cfa || 0) > (p.final_price_cfa || 0) && (
                          <Text style={{fontSize: 11, color: THEME.textGray, textDecorationLine: 'line-through', marginLeft: 6}}>
                            {p.base_price_cfa.toLocaleString()} CFA
                          </Text>
                        )}
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                        <Ionicons name="star" size={10} color="#FBBF24" />
                        <Text style={{fontSize: 10, marginLeft: 2, color: THEME.textGray}}>{p.rating}</Text>
                        <Text style={{fontSize: 10, marginLeft: 4, color: '#9CA3AF'}}>({p.sold} vendus)</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{height: 100}} />
        </ScrollView>
      ) : (
        <>
          <ScrollView style={styles.mainScroll} contentContainerStyle={{padding: 12}}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItemRow}>
                <Image source={{uri: item.product.images[0]}} style={{width: 90, height: 120, borderRadius: 4}} />
                <View style={{flex: 1, marginLeft: 12, justifyContent: 'space-between'}}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontSize: 13, color: THEME.text, flex: 1, marginRight: 8}} numberOfLines={2}>{item.product.name}</Text>
                    <TouchableOpacity onPress={() => removeCartItem(item.id)} style={{padding: 4}}>
                       <Ionicons name="close-outline" size={24} color={THEME.textGray} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{fontSize: 11, color: THEME.textGray, marginTop: 4, backgroundColor: '#F3F4F6', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2}}>
                    {item.color} / {item.size}
                  </Text>
                  
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
                    <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold', color: THEME.danger}}>{item.product.price.toLocaleString('fr-FR')} CFA</Text>
                    <View style={styles.qtyControlBox}>
                      <TouchableOpacity onPress={() => updateCartQty(item.id, -1)} style={styles.qtyBtn}>
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.qty}</Text>
                      <TouchableOpacity onPress={() => updateCartQty(item.id, 1)} style={styles.qtyBtn}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Checkout Strip */}
          <View style={styles.checkoutStrip}>
            <View>
              <Text style={{fontSize: 12, color: THEME.textGray}}>Total ({cart.reduce((s,i)=>s+i.qty,0)} articles)</Text>
              <Text style={{fontSize: 20, fontFamily: 'Poppins-Bold', color: THEME.danger}}>
                {cart.reduce((s, i) => s + (i.product.price * i.qty), 0).toLocaleString('fr-FR')} CFA
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutButtonSolid} onPress={handleProceedToCheckout}>
              <Text style={{color: THEME.white, fontFamily: 'Poppins-Bold', fontSize: 13}}>PASSER LA COMMANDE</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderWishlistScreen = () => {
    const wishItems = products.filter(p => wishlist.includes(p.id));
    return (
      <View style={styles.tabContent}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
            <Text style={{fontSize: 24}}>←</Text>
          </TouchableOpacity>
          <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Ma Liste de Souhaits</Text>
          <View style={{width: 40}} />
        </View>
        <ScrollView style={styles.mainScroll} contentContainerStyle={{padding: 12}}>
          {wishItems.length === 0 ? (
            <View style={{alignItems: 'center', marginTop: 60}}>
               <Ionicons name="heart-dislike-outline" size={80} color={THEME.border} />
               <Text style={{fontSize: 16, color: THEME.textGray, marginTop: 16}}>Votre liste est vide.</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {wishItems.map(p => (
                <TouchableOpacity key={p.id} style={styles.gridItem} onPress={() => handleProductPress(p)}>
                  <View style={styles.productCard}>
                    <View style={{position: 'relative'}}>
                      <Image source={{uri: p.images[0]}} style={styles.productImage} />
                      <TouchableOpacity 
                        style={styles.wishlistIcon} 
                        onPress={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                      >
                        <Ionicons name="heart" size={20} color={THEME.danger} />
                      </TouchableOpacity>
                    </View>
                    <View style={{padding: 8}}>
                      <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                      <Text style={styles.productPrice}>{p.price.toLocaleString('fr-FR')} CFA</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

    const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Header section with Primary Background */}
      <View style={styles.profileHeaderBg}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person-circle-outline" size={48} color={THEME.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.profileName}>{address.fullName}</Text>
            <Text style={styles.profilePhone}>{address.phone}</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Membre Premium</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setCurrentScreen('SETTINGS')}>
            <Ionicons name="settings-outline" size={24} color={THEME.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{flex: 1, marginTop: -20}} contentContainerStyle={{padding: 16, paddingBottom: 40}} showsVerticalScrollIndicator={false}>
        
        {/* Orders Card  - Elevated */}
        <View style={styles.elevatedCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Mes Commandes</Text>
            <TouchableOpacity onPress={() => { setActiveOrderTab('ALL'); setCurrentScreen('ORDERS'); }}>
               <Text style={styles.linkText}>Tout voir &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orderActionsRow}>
            <TouchableOpacity style={styles.orderActionItem} onPress={() => { setActiveOrderTab('TO_PAY'); setCurrentScreen('ORDERS'); }}>
              <View style={styles.iconCircle}><Ionicons name="card-outline" size={22} color={THEME.accent} /></View>
              <Text style={styles.orderActionText}>À payer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderActionItem} onPress={() => { setActiveOrderTab('PROCESSING'); setCurrentScreen('ORDERS'); }}>
              <View style={styles.iconCircle}><Ionicons name="cube-outline" size={22} color={THEME.accent} /></View>
              <Text style={styles.orderActionText}>En prép.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderActionItem} onPress={() => { setActiveOrderTab('SHIPPED'); setCurrentScreen('ORDERS'); }}>
              <View style={styles.iconCircle}><Ionicons name="airplane-outline" size={22} color={THEME.accent} /></View>
              <Text style={styles.orderActionText}>Expédié</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orderActionItem} onPress={() => { setActiveOrderTab('DISPUTES'); setCurrentScreen('ORDERS'); }}>
              <View style={styles.iconCircle}><Ionicons name="alert-circle-outline" size={22} color={THEME.accent} /></View>
              <Text style={styles.orderActionText}>Litiges</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services & Parameters Configuration */}
        <View style={styles.elevatedCard}>
           <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Mes Services</Text>
           
           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('WISHLIST')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="heart-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Liste de souhaits ({wishlist.length})</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('ADDRESS')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="location-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Mes adresses (Bénin)</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('SETTINGS')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="wallet-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Paiements & Monnaie (XOF)</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>
        </View>

        <View style={styles.elevatedCard}>
           <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Aide & Support</Text>
           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('RETURN_POLICY')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="refresh-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Politique de Retour & Remboursement</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('MESSAGES')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="chatbubbles-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Messagerie TrustLink (Admins)</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('HELP')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="headset-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Centre d'aide / Support</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('PRIVACY')}>
             <View style={[styles.menuIconBg, {backgroundColor: '#FFF7ED'}]}><Ionicons name="lock-closed-outline" size={18} color={THEME.accent} /></View>
             <Text style={styles.menuListText}>Confidentialité et Sécurité</Text>
             <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter de TrustLink</Text>
        </TouchableOpacity>
        
        <View style={{height: 40}}/>
      </ScrollView>
    </View>
  );

  const renderAddressScreen = () => (
    <View style={styles.tabContent}>
      {/* Checkout Stepper Header */}
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.white, paddingTop: 16, paddingBottom: 8}}>
          <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold'}}>Panier</Text>
          <View style={{width: 30, height: 1, backgroundColor: THEME.border, marginHorizontal: 8}} />
          <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold', textDecorationLine: 'underline'}}>Adresse</Text>
          <View style={{width: 30, height: 1, backgroundColor: THEME.border, marginHorizontal: 8}} />
          <Text style={{color: THEME.textGray, fontFamily: 'Poppins-Bold'}}>Paiement</Text>
      </View>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Adresse de Livraison</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView style={{padding: 24, backgroundColor: THEME.white}}>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold', marginBottom: 20}}>Confirmez votre adresse (Bénin)</Text>
        
        <View style={{marginBottom: 16}}>
          <Text style={styles.addressLabel}>NOM COMPLET *</Text>
          <TextInput style={styles.addressInput} value={address.fullName} onChangeText={t => setAddress({...address, fullName: t})} placeholder="John Doe" />
        </View>
        <View style={{marginBottom: 16}}>
          <Text style={styles.addressLabel}>TÉLÉPHONE (MTN/MOOV) *</Text>
          <TextInput style={styles.addressInput} value={address.phone} onChangeText={t => setAddress({...address, phone: t})} keyboardType="phone-pad" placeholder="01 23 45 67" />
        </View>
        <View style={{marginBottom: 16}}>
          <Text style={styles.addressLabel}>VILLE *</Text>
          <TextInput style={styles.addressInput} value={address.city} onChangeText={t => setAddress({...address, city: t})} placeholder="Cotonou" />
        </View>
        <View style={{marginBottom: 24}}>
          <Text style={styles.addressLabel}>ADRESSE DÉTAILLÉE / QUARTIER *</Text>
          <TextInput style={styles.addressInput} value={address.street} onChangeText={t => setAddress({...address, street: t})} placeholder="Akpakpa, Rue 12..." />
        </View>

        {/* Map Section */}
        <View style={{marginBottom: 24}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
            <Text style={styles.addressLabel}>POSITION GPS (PIN DRIFT)</Text>
            <TouchableOpacity onPress={getUserLocation} style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="locate" size={16} color={THEME.primary} />
              <Text style={{fontSize: 12, color: THEME.primary, marginLeft: 4, fontFamily: 'Poppins-Bold'}}>Me localiser</Text>
            </TouchableOpacity>
          </View>
          <View style={{height: 250, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderTopColor: THEME.border}}>
            {ENABLE_NATIVE_MAPS && Platform.OS !== 'web' ? (
              <MapView
                style={{flex: 1}}
                region={{
                  latitude: address.lat,
                  longitude: address.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onPress={(e: any) => {
                  setAddress(prev => ({ ...prev, lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude }));
                }}
              >
                <Marker
                  draggable
                  coordinate={{ latitude: address.lat, longitude: address.lng }}
                  onDragEnd={(e: any) => {
                    setAddress(prev => ({ ...prev, lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude }));
                  }}
                  pinColor={THEME.accent}
                  title="Ma Position"
                  description="Glissez le pin vers votre porte exacte"
                />
              </MapView>
            ) : (
              <View style={{ flex: 1, backgroundColor: THEME.backgroundSecondary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="map-outline" size={48} color={THEME.textGray} />
                <Text style={{ color: THEME.textGray, fontSize: 13, marginTop: 10, fontFamily: 'Poppins-Medium' }}>Carte indisponible sur navigateur</Text>
                <Text style={{ color: THEME.textGray, fontSize: 11 }}>Veuillez utiliser l'application mobile pour le GPS</Text>
              </View>
            )}
          </View>
          <Text style={{fontSize: 10, color: THEME.textGray, marginTop: 8, fontStyle: 'italic'}}>
            Lat: {address.lat.toFixed(6)} | Lng: {address.lng.toFixed(6)} • Ces coordonnées seront partagées avec le livreur pour une précision maximale.
          </Text>
        </View>

        <TouchableOpacity style={[styles.sheinBuyButton, {backgroundColor: THEME.accent, marginLeft: 0}]} onPress={() => {
          if(!address.fullName || !address.phone || !address.street || !address.city) {
            alert('Veuillez remplir les champs obligatoires.');
            return;
          }
          if (cart.length > 0) {
             setCurrentScreen('INVOICE');
          } else {
             alert('Adresse sauvegardée avec succès !');
             setCurrentScreen('MAIN');
          }
        }}>
          <Text style={styles.sheinBuyButtonText}>SAUVEGARDER L'ADRESSE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderInvoiceScreen = () => {
    const invoice = calculateInvoice();
    return (
      <View style={styles.tabContent}>
         <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.white, paddingTop: 16, paddingBottom: 8}}>
            <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold'}}>Panier</Text>
            <View style={{width: 30, height: 1, backgroundColor: THEME.border, marginHorizontal: 8}} />
            <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold'}}>Adresse</Text>
            <View style={{width: 30, height: 1, backgroundColor: THEME.border, marginHorizontal: 8}} />
            <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold', textDecorationLine: 'underline'}}>Paiement</Text>
         </View>
         <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('ADDRESS')} style={{padding: 8}}>
            <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Paiement Sécurisé</Text>
          <View style={{width: 40}} />
        </View>
        
        <ScrollView style={{padding: 16}} showsVerticalScrollIndicator={false}>
          {/* Address Summary Box */}
          <View style={styles.addressSummaryCard}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <Ionicons name="location-outline" size={20} color={THEME.primary} style={{marginRight: 8}} />
                <Text style={{fontFamily: 'Poppins-Bold', fontSize: 16}}>Expédier à : {address.fullName}</Text>
              </View>
             <Text style={{color: THEME.textGray}}>{address.phone}</Text>
             <Text style={{color: THEME.textGray}}>{address.street}, {address.city}</Text>
             <TouchableOpacity style={{position: 'absolute', top: 16, right: 16}} onPress={() => setCurrentScreen('ADDRESS')}>
               <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold', fontSize: 12}}>MODIFIER</Text>
             </TouchableOpacity>
          </View>

          {/* Payment Methods */}
          <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold', marginTop: 24, marginBottom: 12}}>Mode de paiement (TrustLink Escrow)</Text>
          <View style={styles.paymentMethodCard}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="wallet-outline" size={24} color={THEME.primary} style={{marginRight: 12}} />
              <View>
                 <Text style={{fontSize: 15, fontFamily: 'Inter-Medium'}}>Mobile Money</Text>
                 <Text style={{fontSize: 12, color: THEME.textGray}}>MTN MoMo / Moov</Text>
              </View>
            </View>
            <View style={{width: 20, height: 20, borderRadius: 10, borderWidth: 6, borderColor: THEME.primary}} />
          </View>

          {/* Order Summary */}
          <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold', marginTop: 24, marginBottom: 12}}>Détails de facturation</Text>
          <View style={{backgroundColor: THEME.white, padding: 16, borderRadius: 8}}>
            <View style={styles.invoiceRowPlain}><Text style={styles.iLabel}>Marchandises ({cart.reduce((s,i)=>s+i.qty,0)} articles)</Text><Text style={styles.iVal}>{invoice.subtotal.toLocaleString()} CFA</Text></View>
            <View style={styles.invoiceRowPlain}><Text style={styles.iLabel}>Logistique (Lagos-Cotonou)</Text><Text style={styles.iVal}>{invoice.shipping.toLocaleString()} CFA</Text></View>
            <View style={styles.invoiceRowPlain}><Text style={styles.iLabel}>Service Escrow (Anti-Fraude)</Text><Text style={styles.iVal}>{invoice.commission.toLocaleString()} CFA</Text></View>
            <View style={styles.invoiceRowPlain}><Text style={styles.iLabel}>Taxes Frontalières</Text><Text style={styles.iVal}>{invoice.taxes.toLocaleString()} CFA</Text></View>
            
            <View style={{height: 1, backgroundColor: THEME.border, marginVertical: 12}} />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold'}}>Total TTC à payer</Text>
              <Text style={{fontSize: 20, fontFamily: 'Poppins-Bold', color: THEME.danger}}>{invoice.total.toLocaleString()} CFA</Text>
            </View>
          </View>

          {/* Terms Agreement */}
          {/* Risk of exchange-rate note */}
          <View style={{backgroundColor: '#FFF7ED', borderLeftWidth: 4, borderLeftColor: THEME.accent, padding: 14, borderRadius: 6, marginTop: 24}}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
              <Ionicons name="warning-outline" size={18} color="#92400E" style={{marginRight: 8}} />
              <Text style={{fontFamily: 'Poppins-Bold', fontSize: 13, color: '#92400E'}}>Risque de change (Remboursement)</Text>
            </View>
            <Text style={{fontSize: 12, color: '#92400E', lineHeight: 18}}>
              En cas de litige justifié, le remboursement en FCFA se fait au taux Naira du jour. Le montant peut être légèrement inférieur au montant initial payé.
            </Text>
            <TouchableOpacity onPress={() => setCurrentScreen('RETURN_POLICY')}>
              <Text style={{color: THEME.primary, fontFamily: 'Poppins-Bold', fontSize: 12, marginTop: 8}}>Lire la Politique complète &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: THEME.white, padding: 16, borderRadius: 8}}>
            <Switch 
               value={acceptedTerms} 
               onValueChange={setAcceptedTerms}
               trackColor={{ false: "#767577", true: THEME.primaryLight }}
               thumbColor={acceptedTerms ? THEME.primary : "#f4f3f4"}
            />
            <Text style={{marginLeft: 12, flex: 1, fontSize: 13, color: THEME.textGray}}>
               J'accepte que mes fonds soient bloqués en Escrow jusqu'à réception confirmée, y compris les conditions de la Politique de Retour TrustLink.
            </Text>
          </View>
          
          <View style={{height: 40}} />
        </ScrollView>

        <View style={styles.checkoutStrip}>
          <TouchableOpacity 
             style={[styles.checkoutButtonSolid, {width: '100%', alignItems: 'center', opacity: acceptedTerms && !loadingProducts ? 1 : 0.5}]} 
             disabled={!acceptedTerms || loadingProducts}
             onPress={handleFinalizePayment}
          >
            {loadingProducts ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{color: THEME.white, fontFamily: 'Poppins-Bold', fontSize: 16}}>PAYER {invoice.total.toLocaleString()} CFA</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReturnPolicy = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={{fontSize: 16, fontFamily: 'Poppins-Bold', flex: 1, textAlign: 'center'}} numberOfLines={1}>Politique de Retour & Remboursement</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 20}} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{backgroundColor: THEME.primary, borderRadius: 10, padding: 16, marginBottom: 20}}>
          <Text style={{color: THEME.white, fontFamily: 'Poppins-Bold', fontSize: 16}}>TrustLink — Politique Unifiée</Text>
          <Text style={{color: '#BFDBFE', fontSize: 12, marginTop: 4}}>Version 2.5 • Gouvernance Opérationnelle Bénin-Nigeria</Text>
        </View>

        <Text style={{fontSize: 14, color: THEME.textGray, lineHeight: 22, marginBottom: 20}}>
          TrustLink transforme le commerce transfrontalier en sécurisant chaque transaction via un système de séquestre. Les fonds ne sont libérés au vendeur qu'après confirmation de réception ou expiration du délai de 48h.
        </Text>

        {/* Escrow section */}
        <View style={styles.policySection}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="shield-checkmark-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
            <Text style={styles.policySectionTitle}>Le Pilier : Le Séquestre (Escrow)</Text>
          </View>
          <Text style={styles.policySectionText}>
            Tous les paiements sont conservés sur un compte sécurisé. Les fonds ne sont libérés que si le client confirme la réception via l'application, ou si le délai de réclamation de 48h est expiré sans litige ouvert.
          </Text>
        </View>

        {/* Currency risk section */}
        <View style={[styles.policySection, {backgroundColor: '#FFF7ED', borderLeftColor: THEME.accent}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="trending-down-outline" size={18} color="#92400E" style={{marginRight: 10}} />
            <Text style={[styles.policySectionTitle, {color: '#92400E'}]}>Risque de Change — Remboursements</Text>
          </View>
          <Text style={[styles.policySectionText, {color: '#92400E'}]}>
            Le paiement en FCFA est converti automatiquement en Naira. En cas de remboursement, la reconversion (Naira → FCFA) se fait au taux du jour. Le montant remboursé peut être inférieur au montant payé initialement.
          </Text>
          <Text style={[styles.policySectionText, {color: '#92400E', marginTop: 6, fontStyle: 'italic'}]}>
            Ex : 5 000 FCFA payés → 4 500 FCFA remboursés si le taux a évolué.
          </Text>
        </View>

        {/* Seller Responsibility */}
        <View style={styles.policySection}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="ribbon-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
            <Text style={styles.policySectionTitle}>Responsabilité du Vendeur</Text>
          </View>
          <Text style={styles.policySectionText}>
            La conformité est la responsabilité exclusive du vendeur. Il doit uploader une vidéo/photo du produit avant expédition. En cas de non-conformité majeure, le vendeur assume les frais de retour.
          </Text>
        </View>

        {/* Proof collection */}
        <View style={styles.policySection}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="camera-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
            <Text style={styles.policySectionTitle}>Collecte des Preuves (48h)</Text>
          </View>
          <Text style={styles.policySectionText}>
            Pour ouvrir un litige, l'acheteur doit soumettre une vidéo d'unboxing continue dans les 48h suivant la livraison, via l'application TrustLink uniquement. Les preuves WhatsApp sont irrecevables.
          </Text>
        </View>

        {/* Resolution Matrix */}
        <Text style={{fontFamily: 'Poppins-Bold', fontSize: 15, marginBottom: 12}}>Matrice de Résolution</Text>
        {[
          {scenario: 'Accident / Perte en transit', remboursement: '100% (Prix + Port)', color: '#D1FAE5'},
          {scenario: 'Non-Conformité constatée', remboursement: '100% via Séquestre + Retour Nigeria', color: '#D1FAE5'},
          {scenario: 'Dommage Mineur', remboursement: 'Avoir partiel — produit conservé', color: '#FEF3C7'},
          {scenario: "Changement d'Avis", remboursement: 'Prix moins frais restockage (retour 48h)', color: '#FEE2E2'},
        ].map((row, i) => (
          <View key={i} style={[styles.policyMatrixRow, {backgroundColor: row.color}]}>
            <Text style={{flex: 1, fontSize: 13, fontFamily: 'Inter-Medium', paddingRight: 8}}>{row.scenario}</Text>
            <Text style={{fontSize: 12, color: THEME.textGray, flex: 1, textAlign: 'right'}}>{row.remboursement}</Text>
          </View>
        ))}

        {/* Exclusions */}
        <View style={[styles.policySection, {backgroundColor: '#FEF2F2', borderLeftColor: THEME.danger, marginTop: 20}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="close-circle-outline" size={18} color={THEME.danger} style={{marginRight: 10}} />
            <Text style={[styles.policySectionTitle, {color: THEME.danger}]}>Exclusions</Text>
          </View>
          <Text style={[styles.policySectionText, {color: '#7F1D1D'}]}>
            • Absence de vidéo d'unboxing{"\n"}
            • Délai de 48h dépassé{"\n"}
            • Dommage causé par le client lui-même{"\n"}
            • Preuves partagées hors-application (WhatsApp, etc.)
          </Text>
        </View>

        {/* Versement */}
        <View style={styles.policySection}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="card-outline" size={18} color={THEME.primary} style={{marginRight: 10}} />
            <Text style={styles.policySectionTitle}>Modalités de Versement</Text>
          </View>
          <Text style={styles.policySectionText}>
            Analyse des preuves en 48h-72h. Remboursement direct sur le Mobile Money lié au compte.
          </Text>
        </View>

        <Text style={{fontSize: 11, color: THEME.textGray, textAlign: 'center', marginTop: 8}}>TrustLink Africa © 2026 — contact@trustlink.africa</Text>
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );

  const renderPaymentSuccess = () => (
    <View style={[styles.tabContent, {justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: THEME.white}]}>
        <Ionicons name="checkmark-circle" size={100} color="#10B981" style={{marginBottom: 20}} />
        <Text style={{fontSize: 26, fontFamily: 'Poppins-Bold', textAlign: 'center', marginBottom: 16, color: THEME.primary}}>Paiement Validé</Text>
        <Text style={{fontSize: 15, color: THEME.textGray, textAlign: 'center', lineHeight: 22}}>
          La commande a bien été prise en compte.
          {"\n\n"}
          Vos fonds ({calculateInvoice().total.toLocaleString()} CFA) sont conservés en toute sécurité par TrustLink.
          Ils ne seront transférés au vendeur nigérian qu'après inspection vidéo à Lagos et bonne réception à Cotonou !
        </Text>
        <TouchableOpacity style={[styles.sheinBuyButton, {backgroundColor: THEME.accent, width: '100%', marginTop: 40, paddingVertical: 16, marginLeft: 0}]} onPress={() => {
          clearCart();
          goHome();
        }}>
          <Text style={styles.sheinBuyButtonText}>VOIR MES COMMANDES & RETOUR</Text>
        </TouchableOpacity>
    </View>
  );

  const renderOrdersScreen = () => {
    const tabs = [
      { key: 'ALL', label: 'Tout' },
      { key: 'TO_PAY', label: 'À payer' },
      { key: 'PROCESSING', label: 'En prép.' },
      { key: 'SHIPPED', label: 'Expédié' },
      { key: 'DISPUTES', label: 'Litiges' }
    ];
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
            <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Mes Commandes</Text>
          <View style={{width: 40}} />
        </View>
        
        <View style={{backgroundColor: THEME.white}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 8}}>
            {tabs.map(tab => (
              <TouchableOpacity 
                key={tab.key} 
                onPress={() => setActiveOrderTab(tab.key as any)}
                style={{
                  paddingVertical: 12, 
                  paddingHorizontal: 16, 
                  borderBottomWidth: 2, 
                  borderBottomColor: activeOrderTab === tab.key ? THEME.accent : 'transparent'
                }}
              >
                <Text style={{
                  color: activeOrderTab === tab.key ? THEME.accent : THEME.textGray,
                  fontFamily: activeOrderTab === tab.key ? 'Poppins-Bold' : 'Inter-Medium'
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 20}}>
            {loadingOrders ? (
              <ActivityIndicator size="large" color={THEME.accent} style={{ marginTop: 40 }} />
            ) : getFilteredOrders().length === 0 ? (
               <View style={{alignItems: 'center', marginTop: 100}}>
                  <Ionicons name="receipt-outline" size={80} color={THEME.border} />
                  <Text style={{fontSize: 16, color: THEME.textGray, marginTop: 16, textAlign: 'center'}}>
                    {activeOrderTab === 'ALL' ? "Vous n'avez pas encore de commande." : `Aucune commande dans la section "${tabs.find(t => t.key === activeOrderTab)?.label}".`}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.sheinBuyButton, {backgroundColor: THEME.accent, marginTop: 20, width: 'auto', paddingHorizontal: 30, marginLeft: 0}]} 
                    onPress={() => { setCurrentScreen('MAIN'); setActiveTab('HOME'); }}
                  >
                    <Text style={styles.sheinBuyButtonText}>ALLER À LA BOUTIQUE</Text>
                  </TouchableOpacity>
               </View>
            ) : (
              getFilteredOrders().map((order) => (
                <View key={order.id} style={[styles.elevatedCard, { marginBottom: 16, padding: 12 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 10, marginBottom: 10 }}>
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 13 }}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={{ color: THEME.accent, fontFamily: 'Poppins-Bold', fontSize: 12 }}>{getStatusLabel(order.status)}</Text>
                  </View>
                  
                  {order.order_items?.map((item: any, idx: number) => (
                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <Image source={{ uri: item.product?.image_url }} style={{ width: 50, height: 50, borderRadius: 4, backgroundColor: '#f0f0f0' }} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium' }} numberOfLines={1}>{item.product?.name}</Text>
                        <Text style={{ fontSize: 11, color: THEME.textGray }}>Qté: {item.quantity} • {item.price_cfa?.toLocaleString()} CFA</Text>
                      </View>
                    </View>
                  ))}

                  <View style={{ borderTopWidth: 1, borderTopColor: THEME.border, paddingTop: 10, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Text style={{ fontSize: 11, color: THEME.textGray }}>{new Date(order.created_at).toLocaleDateString()}</Text>
                     <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14 }}>Total: {order.total_cfa?.toLocaleString()} CFA</Text>
                  </View>
                </View>
              ))
            )}
        </ScrollView>
      </View>
    );
  };

  const renderNotificationsScreen = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Notifications</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 0}}>
         {[
           {id: 1, title: "Bienvenue sur TrustLink !", text: "Découvrez notre sélection Shein et profitez des meilleurs prix vers le Bénin.", date: "Aujourd'hui", icon: "gift-outline"},
           {id: 2, title: "Sécurité Escrow", text: "N'oubliez pas que vos fonds sont bloqués jusqu'à la réception de votre colis.", date: "Hier", icon: "shield-checkmark-outline"},
           {id: 3, title: "Nouveautés High-Tech", text: "Les derniers modèles de casques et écouteurs sont arrivés au hub de Lagos.", date: "Il y a 2 jours", icon: "flash-outline"}
         ].map((notif) => (
           <View key={notif.id} style={{backgroundColor: THEME.white, padding: 16, borderBottomWidth: 1, borderBottomColor: THEME.border, flexDirection: 'row'}}>
             <View style={[styles.menuIconBg, {backgroundColor: THEME.primary+'10', marginRight: 16, padding: 8, borderRadius: 20}]}><Ionicons name={notif.icon as any} size={20} color={THEME.primary} /></View>
             <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                  <Text style={{fontFamily: 'Poppins-Bold', fontSize: 14}}>{notif.title}</Text>
                  <Text style={{fontSize: 11, color: THEME.textGray}}>{notif.date}</Text>
                </View>
                <Text style={{fontSize: 13, color: THEME.textGray, lineHeight: 18}}>{notif.text}</Text>
             </View>
           </View>
         ))}
      </ScrollView>
    </View>
  );

  const renderSettingsScreen = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Paramètres</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16}}>
         <View style={styles.elevatedCard}>
            <Text style={[styles.cardTitle, {marginBottom: 16}]}>Compte & Profil</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
               <View style={styles.profileAvatar}><Ionicons name="person-circle-outline" size={40} color={THEME.primary} /></View>
               <View style={{marginLeft: 12}}>
                  <Text style={{fontFamily: 'Poppins-Bold'}}>{address.fullName}</Text>
                  <Text style={{fontSize: 12, color: THEME.textGray}}>{address.phone}</Text>
               </View>
            </View>
            <TouchableOpacity style={styles.menuListItem} onPress={() => setCurrentScreen('ADDRESS')}>
               <Text style={styles.menuListText}>Modifier mes informations</Text>
               <Ionicons name="chevron-forward" size={16} color={THEME.border} />
            </TouchableOpacity>
         </View>

         <View style={styles.elevatedCard}>
            <Text style={[styles.cardTitle, {marginBottom: 16}]}>Préférences</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
               <Text style={styles.menuListText}>Devise d'affichage</Text>
               <Text style={{fontFamily: 'Poppins-Bold', color: THEME.primary}}>FCFA (XOF)</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
               <Text style={styles.menuListText}>Langue</Text>
               <Text style={{fontFamily: 'Poppins-Bold', color: THEME.primary}}>Français</Text>
            </View>
             <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
               <Text style={styles.menuListText}>Notifications Push</Text>
               <Switch value={true} trackColor={{false: '#ccc', true: THEME.primary}} />
            </View>
         </View>
      </ScrollView>
    </View>
  );

  const renderHelpScreen = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Centre d'aide</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 20}}>
         <Text style={{fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 8}}>Comment pouvons-nous vous aider ?</Text>
         <Text style={{color: THEME.textGray, marginBottom: 24}}>Retrouvez les réponses à vos questions les plus fréquentes.</Text>
         
         {[
           {q: "Comment fonctionne le paiement Escrow ?", a: "Votre paiement est conservé par TrustLink et n'est versé au vendeur que lorsque vous confirmez la bonne réception de votre colis ou après un délai de 48h sans litige."},
           {q: "Quel est le délai de livraison ?", a: "La livraison du hub de Lagos vers Cotonou prend généralement entre 48h et 72h ouvrables après réception de l'article au hub."},
           {q: "Puis-je retourner un article ?", a: "Oui, si l'article est non-conforme. Consultez notre Politique de Retour pour connaître les conditions et la procédure."},
           {q: "Comment contacter le support ?", a: "Vous pouvez nous joindre par email à support@trustlink.africa ou via le chat WhatsApp officiel."}
         ].map((item, i) => (
           <View key={i} style={{backgroundColor: THEME.white, padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: THEME.accent}}>
              <Text style={{fontFamily: 'Poppins-Bold', fontSize: 14, marginBottom: 6}}>{item.q}</Text>
              <Text style={{fontSize: 13, color: THEME.textGray, lineHeight: 20}}>{item.a}</Text>
           </View>
         ))}

         <TouchableOpacity 
           style={[styles.sheinBuyButton, {backgroundColor: THEME.accent, marginTop: 12, width: '100%', marginLeft: 0, flexDirection: 'row', justifyContent: 'center'}]}
           onPress={() => setCurrentScreen('MESSAGES')}
         >
           <Ionicons name="chatbubbles-outline" size={20} color="white" style={{marginRight: 10}} />
           <Text style={styles.sheinBuyButtonText}>MESSAGERIE INTERNE (CHATER)</Text>
         </TouchableOpacity>

         <TouchableOpacity 
           style={[styles.sheinBuyButton, {backgroundColor: THEME.primary, marginTop: 12, width: '100%', marginLeft: 0, flexDirection: 'row', justifyContent: 'center'}]}
           onPress={() => alert("Chat WhatsApp (Simulation)")}
         >
           <Ionicons name="logo-whatsapp" size={20} color="white" style={{marginRight: 10}} />
           <Text style={styles.sheinBuyButtonText}>CONTACTER SUR WHATSAPP</Text>
         </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderMessagesScreen = () => {
    const handleSendMessage = () => {
      const trimmedText = messageInput.trim();
      if (!trimmedText) return;

      const newMessage = {
        id: Date.now(),
        text: trimmedText,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const updatedMessages = [...userMessages, newMessage];
      setUserMessages(updatedMessages);
      setMessageInput('');
      
      // Auto-reply logic: only if no admin reply in the last 24h
      const lastAdminMsg = [...userMessages].reverse().find(m => m.sender === 'admin');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (!lastAdminMsg || (now - (lastAdminMsg.timestamp || 0)) > oneDay) {
        setTimeout(() => {
          const reply = {
            id: Date.now() + 1,
            text: "Merci pour votre message. Un administrateur TrustLink vous répondra très prochainement.",
            sender: 'admin',
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setUserMessages(prev => [...prev, reply]);
        }, 1500);
      }
    };

    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
            <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
          </TouchableOpacity>
          <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Messagerie</Text>
          <View style={{width: 40}} />
        </View>

        <ScrollView 
          style={{flex: 1, backgroundColor: '#F3F4F6'}} 
          contentContainerStyle={{padding: 16}}
          ref={(ref) => ref?.scrollToEnd({animated: true})}
        >
          {userMessages.map((msg) => (
            <View 
              key={msg.id} 
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? THEME.accent : THEME.white,
                padding: 12,
                borderRadius: 12,
                maxWidth: '80%',
                marginBottom: 12,
                borderBottomRightRadius: msg.sender === 'user' ? 2 : 12,
                borderBottomLeftRadius: msg.sender === 'admin' ? 2 : 12,
                elevation: 1,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: {width: 0, height: 1},
                shadowRadius: 1
              }}
            >
              <Text style={{color: msg.sender === 'user' ? THEME.white : THEME.text, fontSize: 14}}>{msg.text}</Text>
              <Text style={{
                fontSize: 10, 
                color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : THEME.textGray, 
                alignSelf: 'flex-end', 
                marginTop: 4
              }}>
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          padding: 12, 
          backgroundColor: THEME.white, 
          borderTopWidth: 1, 
          borderTopColor: THEME.border
        }}>
          <TextInput 
            style={{
              flex: 1, 
              backgroundColor: '#F3F4F6', 
              borderRadius: 20, 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              marginRight: 10,
              maxHeight: 100
            }}
            placeholder="Écrivez votre message..."
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            style={{
              backgroundColor: THEME.accent,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderPrivacyScreen = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>Confidentialité</Text>
        <View style={{width: 40}} />
      </View>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 24}}>
         <Text style={{fontSize: 18, fontFamily: 'Poppins-Bold', marginBottom: 16}}>Politique de Confidentialité</Text>
         <Text style={{color: THEME.textGray, lineHeight: 22, fontSize: 14, marginBottom: 16}}>
            Chez TrustLink, nous accordons une importance capitale à la protection de vos données personnelles. 
            Toutes les informations que vous partagez avec nous (Nom, Téléphone, Adresse) sont utilisées exclusivement pour le traitement de vos commandes et l'amélioration de nos services.
         </Text>
         <Text style={{fontFamily: 'Poppins-Bold', fontSize: 15, marginBottom: 8}}>1. Données collectées</Text>
         <Text style={{color: THEME.textGray, lineHeight: 20, fontSize: 13, marginBottom: 16}}>
            Nous collectons votre nom, numéro de téléphone et adresse de livraison pour assurer le bon acheminement de vos colis depuis le Nigeria vers le Bénin.
         </Text>
         <Text style={{fontFamily: 'Poppins-Bold', fontSize: 15, marginBottom: 8}}>2. Sécurité des paiements</Text>
         <Text style={{color: THEME.textGray, lineHeight: 20, fontSize: 13, marginBottom: 16}}>
            Vos informations de paiement ne sont jamais stockées sur nos serveurs. Elles sont traitées de manière sécurisée par FedaPay.
         </Text>
         <Text style={{fontFamily: 'Poppins-Bold', fontSize: 15, marginBottom: 8}}>3. Partage des données</Text>
         <Text style={{color: THEME.textGray, lineHeight: 20, fontSize: 13, marginBottom: 24}}>
            Nous ne partageons vos données qu'avec les prestataires logistiques nécessaires à la livraison de vos commandes. Nous ne vendons jamais vos données à des tiers.
         </Text>
         <Text style={{fontSize: 12, color: THEME.border, textAlign: 'center'}}>Dernière mise à jour : 15 Avril 2026</Text>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {currentScreen === 'MAIN' && (
          <>
            {activeTab === 'HOME' && renderHomeMain()}
            {activeTab === 'CART' && renderCartTab()}
            {activeTab === 'PROFILE' && renderProfileTab()}
          </>
        )}
        
        {currentScreen === 'PRODUCT_DETAIL' && renderProductDetail()}
        {currentScreen === 'ADDRESS' && renderAddressScreen()}
        {currentScreen === 'INVOICE' && renderInvoiceScreen()}
        {currentScreen === 'PAYMENT_SUCCESS' && renderPaymentSuccess()}
        {currentScreen === 'WISHLIST' && renderWishlistScreen()}
        {currentScreen === 'RETURN_POLICY' && renderReturnPolicy()}
        {currentScreen === 'ORDERS' && renderOrdersScreen()}
        {currentScreen === 'NOTIFICATIONS' && renderNotificationsScreen()}
        {currentScreen === 'SETTINGS' && renderSettingsScreen()}
        {currentScreen === 'HELP' && renderHelpScreen()}
        {currentScreen === 'PRIVACY' && renderPrivacyScreen()}
        {currentScreen === 'MESSAGES' && renderMessagesScreen()}
      </View>

      {/* Main Bottom Navigation (Only visible on MAIN screens) */}
      {currentScreen === 'MAIN' && (
        <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('HOME')}>
            <Ionicons 
              name={activeTab === 'HOME' ? "home" : "home-outline"} 
              size={24} 
              color={activeTab === 'HOME' ? THEME.accent : THEME.textGray} 
            />
            <Text style={[styles.tabText, activeTab === 'HOME' && {color: THEME.accent, fontFamily: 'Poppins-Bold'}]}>Boutique</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('CART')}>
            <View>
              <Ionicons 
                name={activeTab === 'CART' ? "cart" : "cart-outline"} 
                size={24} 
                color={activeTab === 'CART' ? THEME.accent : THEME.textGray} 
              />
              {cart.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{cart.reduce((s, i) => s + i.qty, 0)}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabText, activeTab === 'CART' && {color: THEME.accent, fontFamily: 'Poppins-Bold'}]}>Panier</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('PROFILE')}>
             <Ionicons 
              name={activeTab === 'PROFILE' ? "person" : "person-outline"} 
              size={24} 
              color={activeTab === 'PROFILE' ? THEME.accent : THEME.textGray} 
            />
            <Text style={[styles.tabText, activeTab === 'PROFILE' && {color: THEME.accent, fontFamily: 'Poppins-Bold'}]}>Moi</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  // Home Shein Header
  sheinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoImageLarge: {
    width: 120, // Increased size significantly
    height: 70,
    marginRight: 20,
    marginLeft: -30,
  },
  sheinSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  sheinSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  pillCategory: {
    backgroundColor: THEME.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  pillCategoryActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.text,
  },
  pillCategoryText: {
    fontSize: 14,
    color: THEME.text,
    fontFamily: 'Inter-Regular',
},
  pillCategoryTextActive: {
    fontSize: 14,
    color: THEME.white,
    fontFamily: 'Poppins-Bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  gridItem: {
    width: '50%',
    padding: 6,
  },
  productCard: {
    backgroundColor: THEME.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 240, // Taller image for Fashion aesthetic
  },
  wishlistIcon: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center'
  },
  tagBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: THEME.danger,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2,
  },
  productName: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
    height: 32,
    marginBottom: 6,
    fontFamily: 'Inter-Medium',
},
  productPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: THEME.text,
  },
  
  // Detail
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  cartBadgeAbs: {
    position: 'absolute',
    top: 4, right: 4,
    backgroundColor: THEME.danger,
    width: 16, height: 16,
    borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'white'
  },
  chip: {
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  chipActive: {
    borderColor: THEME.text,
    backgroundColor: '#F3F4F6',
  },
  chipText: {
    fontSize: 13,
    color: THEME.text,
  },
  chipTextActive: {
    fontFamily: 'Poppins-Bold',
  },
  fixedBottomNav: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 24 : 12,
    alignItems: 'center',
  },
  sheinBuyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 16,
  },
  sheinBuyButtonText: {
    color: THEME.white,
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  
  // Cart
  sheinHeaderCart: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    position: 'relative'
  },
  cartItemRow: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  qtyControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 20,
    height: 28,
  },
  qtyBtn: {
    width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center'
  },
  qtyBtnText: {
    fontSize: 16, color: THEME.text
  },
  qtyValue: {
    width: 24, textAlign: 'center', fontSize: 13, fontFamily: 'Poppins-Bold'
  },
  checkoutStrip: {
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButtonSolid: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
  },

  // Address
  addressLabel: {
    fontSize: 12,
    color: THEME.textGray,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold'
  },
  addressInput: {
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.background,
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
  },
  
  // Profile Modern
  profileHeaderBg: {
    backgroundColor: THEME.primaryDark,
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileAvatar: {
    width: 72, height: 72, 
    borderRadius: 36, 
    backgroundColor: THEME.white, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  profileName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: THEME.white,
    marginBottom: 2,
  },
  profilePhone: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#E5E7EB',
    marginBottom: 6,
  },
  profileBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: THEME.white,
  },
  elevatedCard: {
    backgroundColor: THEME.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: THEME.border, 
    paddingBottom: 12, 
    marginBottom: 16
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold', 
    fontSize: 15,
    color: THEME.text
  },
  linkText: {
    fontFamily: 'Inter-Medium',
    color: THEME.textGray, 
    fontSize: 12
  },
  orderActionsRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between'
  },
  orderActionItem: {
    alignItems: 'center',
    width: '25%'
  },
  iconCircle: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11, 
    textAlign: 'center',
    color: THEME.text
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconBg: {
    width: 36, height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuListText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: THEME.text
  },
  menuListChevron: {
    fontFamily: 'Inter-Bold',
    color: '#D1D5DB',
    fontSize: 16
  },
  logoutButton: {
    backgroundColor: THEME.white, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FCC2C2'
  },
  logoutButtonText: {
    fontFamily: 'Poppins-Bold',
    color: THEME.danger, 
  },
  
  // Invoice
  addressSummaryCard: {
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  paymentMethodCard: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceRowPlain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iLabel: { color: THEME.textGray, fontSize: 13 },
  iVal: { color: THEME.text, fontSize: 13, fontFamily: 'Inter-Medium' },

  // Generic
  mainScroll: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.4,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabText: {
    fontSize: 10,
    color: THEME.textGray,
    fontFamily: 'Inter-Medium',
  },
  tabTextActive: {
    color: THEME.text,
    fontFamily: 'Poppins-Bold',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: THEME.danger,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.white,
  },
  tabBadgeText: {
    color: THEME.white,
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
  },
  // Return Policy
  policySection: {
    backgroundColor: THEME.white,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
    padding: 14,
    borderRadius: 6,
    marginBottom: 16,
  },
  policySectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: THEME.text,
    marginBottom: 8,
  },
  policySectionText: {
    fontSize: 13,
    color: THEME.textGray,
    lineHeight: 20,
  },
  policyMatrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  // Section Navigation Tabs
  sectionTabsBar: {
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    height: 44,
  },
  sectionTabItem: {
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sectionTabText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: THEME.textGray,
  },
  sectionTabTextActive: {
    color: THEME.text,
    fontFamily: 'Poppins-Bold',
  },
  sectionTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: THEME.accent,
    borderRadius: 2,
  },
});
