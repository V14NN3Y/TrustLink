import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';

// TrustLink Brand Colors
const COLORS = {
  primary: '#125C8D', 
  accent: '#FF6A00',  
  background: '#F8F9FA',
  white: '#FFFFFF',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
  dark: '#212529',
  success: '#28A745',
  danger: '#DC2626',
};

// Hardcoded for MVP - would come from Auth
const CURRENT_SELLER_ID = '9ca79d85-f55e-49cd-9a84-17793d56ef8f'; 

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [sellerMessages, setSellerMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Mode',
    base_price_cfa: '',
    discount_percent: '0',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
  });

  useEffect(() => {
    fetchOrders();
    fetchCatalog();
    fetchMessages();
    
    // Real-time subscription
    const channel = supabase
      .channel('vendor_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_orders' }, payload => {
        fetchOrders();
      })
      .subscribe();

    const msgChannel = supabase
      .channel('vendor_messages_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vendor_messages' }, payload => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(msgChannel);
    };
  }, []);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('vendor_messages')
      .select('*')
      .eq('seller_id', CURRENT_SELLER_ID)
      .order('created_at', { ascending: true });

    if (!error) {
      setSellerMessages(data || []);
    }
  }

  async function fetchCatalog() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', CURRENT_SELLER_ID)
      .order('created_at', { ascending: false });

    if (!error) {
      setCatalogProducts(data || []);
    }
  }

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('vendor_orders')
      .select(`
        *,
        vendor_order_items (*)
      `)
      .eq('seller_id', CURRENT_SELLER_ID)
      .order('created_at', { ascending: false });

    if (!error) {
      setOrders(data || []);
    }
    setLoading(false);
  }

  async function handleMarkAsReady(orderId: string) {
    const { error } = await supabase
      .from('vendor_orders')
      .update({ status: 'READY' })
      .eq('id', orderId);
    
    if (error) alert('Erreur: ' + error.message);
    else fetchOrders();
  }

  async function handleAddProduct() {
    if (!newProduct.name || !newProduct.base_price_cfa) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    const basePrice = parseFloat(newProduct.base_price_cfa);
    const discount = parseFloat(newProduct.discount_percent || '0');
    const finalPrice = basePrice * (1 - discount / 100);

    const { error } = await supabase
      .from('products')
      .insert([{
        seller_id: CURRENT_SELLER_ID,
        name: newProduct.name,
        category: newProduct.category,
        base_price_cfa: basePrice,
        discount_percent: discount,
        final_price_cfa: finalPrice,
        image_url: newProduct.image_url,
        is_active: true
      }]);

    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      alert('Produit ajouté avec succès !');
      setNewProduct({
        name: '',
        category: 'Mode',
        base_price_cfa: '',
        discount_percent: '0',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
      });
      fetchCatalog();
      setActiveTab('catalog');
    }
    setIsSubmitting(false);
  }

  const renderDashboard = () => (
    <>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.statLabel}>Ventes Totales</Text>
          <Text style={styles.statValue}>{(orders.length * 25000).toLocaleString()} CFA</Text>
          <Ionicons name="trending-up" size={20} color="rgba(255,255,255,0.6)" style={styles.statIcon} />
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.white }]}>
          <Text style={[styles.statLabel, { color: COLORS.gray }]}>Commandes</Text>
          <Text style={[styles.statValue, { color: COLORS.dark }]}>{orders.length}</Text>
          <Ionicons name="cube-outline" size={20} color={COLORS.lightGray} style={styles.statIcon} />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab('add_product')}>
          <View style={[styles.actionIconCircle, { backgroundColor: COLORS.accent }]}>
            <Ionicons name="add" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.actionText}>Nouveau</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveTab('catalog')}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#E1F0FF' }]}>
            <Ionicons name="list-outline" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Catalogue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#F0FFF4' }]}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.actionText}>Paiements</Text>
        </TouchableOpacity>
      </View>

      {/* Orders Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Commandes du Hub</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="clipboard-outline" size={60} color={COLORS.lightGray} />
            <Text style={{ color: COLORS.gray, marginTop: 10 }}>Aucune commande pour le moment</Text>
          </View>
        ) : (
          orders.map((order: any) => (
            <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#SEC-{order.id.slice(0, 8).toUpperCase()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: order.status === 'READY' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 106, 0, 0.1)' }]}>
                <Text style={[styles.statusText, { color: order.status === 'READY' ? COLORS.success : COLORS.accent }]}>
                  {order.status === 'READY' ? 'PRÊT' : 'À PRÉPARER'}
                </Text>
              </View>
            </View>
            <View style={styles.orderBody}>
              {order.vendor_order_items?.map((item: any) => (
                <View key={item.id} style={styles.productInfo}>
                  <View style={styles.productImagePlaceholder}>
                      <Ionicons name="shirt" size={30} color={COLORS.lightGray} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName} numberOfLines={1}>Produit #{item.product_id.slice(0, 6)}</Text>
                    <Text style={styles.productVariants}>Quantité: {item.quantity}</Text>
                    <Text style={styles.productQty}>{item.price_payout_cfa.toLocaleString()} CFA</Text>
                  </View>
                </View>
              ))}
            </View>
            {order.status !== 'READY' && (
              <TouchableOpacity 
                style={styles.prepareBtn}
                onPress={() => handleMarkAsReady(order.id)}
              >
                <Text style={styles.prepareBtnText}>Marquer comme Prêt</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </>
  );

  const renderCatalog = () => (
    <View style={{ paddingBottom: 40 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mon Catalogue</Text>
        <TouchableOpacity onPress={() => setActiveTab('add_product')} style={{ backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>+ AJOUTER</Text>
        </TouchableOpacity>
      </View>
      
      {catalogProducts.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="list-outline" size={60} color={COLORS.lightGray} />
          <Text style={{ color: COLORS.gray, marginTop: 10 }}>Aucun produit dans le catalogue</Text>
        </View>
      ) : (
        catalogProducts.map(product => (
          <View key={product.id} style={styles.productListItem}>
            <Image source={{ uri: product.image_url }} style={styles.catalogImage} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.catalogProductName}>{product.name}</Text>
              <Text style={styles.catalogCategory}>{product.category}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.catalogPrice}>{product.final_price_cfa.toLocaleString()} CFA</Text>
                {product.discount_percent > 0 && <Text style={styles.catalogDiscount}>-{product.discount_percent}%</Text>}
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn}>
               <Ionicons name="create-outline" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderAddProduct = () => (
    <View style={{ paddingBottom: 40 }}>
      <Text style={styles.sectionTitle}>Ajouter un Produit</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Nom du Produit</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Sneakers Streetwear" 
          value={newProduct.name}
          onChangeText={(val) => setNewProduct({...newProduct, name: val})}
        />

        <Text style={styles.inputLabel}>Catégorie</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Mode, High-Tech, Alimentation..." 
          value={newProduct.category}
          onChangeText={(val) => setNewProduct({...newProduct, category: val})}
        />

        <View style={{ flexDirection: 'row', gap: 15, marginTop: 15 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Prix de Base (CFA)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0" 
              keyboardType="numeric"
              value={newProduct.base_price_cfa}
              onChangeText={(val) => setNewProduct({...newProduct, base_price_cfa: val})}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Remise (%)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0" 
              keyboardType="numeric"
              value={newProduct.discount_percent}
              onChangeText={(val) => setNewProduct({...newProduct, discount_percent: val})}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>URL de l'Image</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://..." 
          value={newProduct.image_url}
          onChangeText={(val) => setNewProduct({...newProduct, image_url: val})}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleAddProduct}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Mettre en Ligne</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const [activeHistoryFilter, setActiveHistoryFilter] = useState('Tout');
  
  const getFilteredHistory = () => {
    if (activeHistoryFilter === 'Tout') return orders;
    if (activeHistoryFilter === 'Finies') return orders.filter(o => o.status === 'COMPLETED');
    if (activeHistoryFilter === 'Livrées') return orders.filter(o => o.status === 'PICKED_UP');
    if (activeHistoryFilter === 'En cours') return orders.filter(o => ['PENDING', 'PREPARING', 'READY'].includes(o.status));
    return orders;
  };

  const renderHistory = () => (
    <View style={{ paddingBottom: 40 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Historique des Commandes</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {['Tout', 'Finies', 'Livrées', 'En cours'].map(filter => (
          <TouchableOpacity 
            key={filter} 
            onPress={() => setActiveHistoryFilter(filter)}
            style={[styles.filterTag, activeHistoryFilter === filter && styles.filterTagActive]}
          >
            <Text style={[styles.filterTagText, activeHistoryFilter === filter && styles.filterTagTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {getFilteredHistory().length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Ionicons name="time-outline" size={60} color={COLORS.lightGray} />
          <Text style={{ color: COLORS.gray, marginTop: 10 }}>Aucun historique pour ce filtre</Text>
        </View>
      ) : (
        getFilteredHistory().map((order: any) => (
          <View key={order.id} style={styles.orderCard}>
             <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={{ fontSize: 12, color: COLORS.gray }}>{new Date(order.created_at).toLocaleDateString()}</Text>
             </View>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>{order.total_payout_cfa.toLocaleString()} CFA</Text>
                <View style={[styles.statusBadge, { backgroundColor: order.status === 'COMPLETED' ? 'rgba(40, 167, 69, 0.1)' : order.status === 'PICKED_UP' ? 'rgba(0, 123, 255, 0.1)' : 'rgba(255, 106, 0, 0.1)' }]}>
                  <Text style={[styles.statusText, { color: order.status === 'COMPLETED' ? COLORS.success : order.status === 'PICKED_UP' ? COLORS.primary : COLORS.accent }]}>
                    {order.status === 'COMPLETED' ? 'TERMINÉE' : order.status === 'PICKED_UP' ? 'LIVRÉE' : 'EN COURS'}
                  </Text>
                </View>
             </View>
          </View>
        ))
      )}
    </View>
  );

  const renderMessages = () => (
    <KeyboardAvoidingView 
      style={{ flex: 1, height: 600 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
       <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chat avec le Hub Admin</Text>
      </View>
      
      <ScrollView 
        style={{ flex: 1, backgroundColor: COLORS.white, borderRadius: 20, padding: 15 }}
        ref={(ref) => ref?.scrollToEnd({animated: true})}
      >
        {sellerMessages.length === 0 ? (
           <View style={{ alignItems: 'center', marginTop: 40 }}>
             <Ionicons name="chatbubbles-outline" size={40} color={COLORS.lightGray} />
             <Text style={{ color: COLORS.gray, marginTop: 10 }}>Discutez avec l'équipe TrustLink</Text>
           </View>
        ) : (
          sellerMessages.map((msg, i) => (
            <View key={i} style={[styles.msgBubble, msg.sender === 'seller' ? styles.msgSeller : styles.msgAdmin]}>
               <Text style={[styles.msgText, msg.sender === 'seller' ? { color: 'white' } : { color: COLORS.dark }]}>{msg.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, marginBottom: 10, alignItems: 'center' }}>
         <TextInput 
            style={[styles.input, { flex: 1, marginTop: 0, maxHeight: 120 }]} 
            placeholder="Tapez votre message..." 
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
         />
         <TouchableOpacity 
           style={{ backgroundColor: COLORS.primary, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}
           onPress={async () => {
              if (messageInput.trim()) {
                const newMsg = { text: messageInput, sender: 'seller', seller_id: CURRENT_SELLER_ID };
                setMessageInput('');
                setSellerMessages([...sellerMessages, newMsg]); // Optimistic update
                await supabase.from('vendor_messages').insert([newMsg]);
              }
           }}
         >
            <Ionicons name="send" size={24} color="white" />
         </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            {activeTab === 'dashboard' ? 'Tableau de Bord' : 
             activeTab === 'catalog' ? 'Catalogue' : 
             activeTab === 'history' ? 'Historique' :
             activeTab === 'messages' ? 'Messages Hub' : 'Nouveau Produit'}
          </Text>
          <Text style={styles.storeName}>Mode Chic Sarl</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.dark} />
          {orders.filter(o => o.status === 'PENDING').length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'catalog' && renderCatalog()}
        {activeTab === 'add_product' && renderAddProduct()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'messages' && renderMessages()}
      </ScrollView>

      {/* Navigation Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={styles.tabItem}>
          <Ionicons name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'} size={24} color={activeTab === 'dashboard' ? COLORS.primary : COLORS.gray} />
          <Text style={[styles.tabLabel, { color: activeTab === 'dashboard' ? COLORS.primary : COLORS.gray }]}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('catalog')} style={styles.tabItem}>
          <Ionicons name={activeTab === 'catalog' ? 'shirt' : 'shirt-outline'} size={24} color={activeTab === 'catalog' ? COLORS.primary : COLORS.gray} />
          <Text style={[styles.tabLabel, { color: activeTab === 'catalog' ? COLORS.primary : COLORS.gray }]}>Produits</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={styles.tabItem}>
          <Ionicons name={activeTab === 'history' ? 'time' : 'time-outline'} size={24} color={activeTab === 'history' ? COLORS.primary : COLORS.gray} />
          <Text style={[styles.tabLabel, { color: activeTab === 'history' ? COLORS.primary : COLORS.gray }]}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('messages')} style={styles.tabItem}>
          <Ionicons name={activeTab === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={activeTab === 'messages' ? COLORS.primary : COLORS.gray} />
          <Text style={[styles.tabLabel, { color: activeTab === 'messages' ? COLORS.primary : COLORS.gray }]}>Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storeName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 5,
  },
  statIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    opacity: 0.2,
    transform: [{ scale: 2 }],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.dark,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 100,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 15,
    marginBottom: 15,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: 'rgba(18, 92, 141, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  productInfo: {
    flexDirection: 'row',
    gap: 15,
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.background,
    borderRadius: 18,
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
  },
  productVariants: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '500',
  },
  productQty: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    marginTop: 2,
  },
  prepareBtn: {
    backgroundColor: COLORS.dark,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  prepareBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingBottom: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  productListItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  catalogImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  catalogProductName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
  },
  catalogCategory: {
    fontSize: 11,
    color: COLORS.gray,
  },
  catalogPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
  },
  catalogDiscount: {
    fontSize: 10,
    color: COLORS.white,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  editBtn: {
    padding: 8,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 15,
    fontSize: 14,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catPickBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  catPickActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catPickText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  catPickTextActive: {
    color: COLORS.white,
  },
  submitBtn: {
    backgroundColor: COLORS.dark,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderBody: {
    paddingVertical: 5,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterTagActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray,
  },
  filterTagTextActive: {
    color: COLORS.white,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  msgSeller: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  msgAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
  },
  msgText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
