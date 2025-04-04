import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, FontAwesome, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';
import MenuButton from '../components/MenuButton';
import ScrollableContentContainer from '../components/ScrollableContentContainer';

const { width } = Dimensions.get('window');

// Define available status types
const STATUS_TYPES = {
  ONLINE: 'online',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

const ProfileScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('photos');
  const [showBioExpanded, setShowBioExpanded] = useState(false);
  const [userStatus, setUserStatus] = useState(STATUS_TYPES.ONLINE);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  
  const statusSelectorAnim = useRef(new Animated.Value(0)).current;
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  const toggleBioExpanded = () => {
    setShowBioExpanded(!showBioExpanded);
  };

  const navigateToAccount = () => {
    router.push('/(main)/account');
  };

  // Function to show status selector with animation
  const showStatusMenu = () => {
    setShowStatusSelector(true);
    Animated.timing(statusSelectorAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Function to hide status selector with animation
  const hideStatusMenu = () => {
    Animated.timing(statusSelectorAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowStatusSelector(false);
    });
  };

  // Function to change status and close menu
  const changeStatus = (newStatus: string) => {
    setUserStatus(newStatus);
    hideStatusMenu();
  };

  // Get status data based on current status
  const getStatusData = () => {
    switch(userStatus) {
      case STATUS_TYPES.ONLINE:
        return {
          color: '#7ADA72', // Green
          text: 'Online',
          subtext: 'Active Now',
          glowColor: 'rgba(122, 218, 114, 0.3)'
        };
      case STATUS_TYPES.BUSY:
        return {
          color: '#E57373', // Red
          text: 'Busy',
          subtext: 'Do Not Disturb',
          glowColor: 'rgba(229, 115, 115, 0.3)'
        };
      case STATUS_TYPES.OFFLINE:
        return {
          color: '#35383F', // Dark gray/black
          text: 'Offline',
          subtext: 'Invisible to Others',
          glowColor: 'rgba(53, 56, 63, 0.3)'
        };
      default:
        return {
          color: '#7ADA72',
          text: 'Online',
          subtext: 'Active Now',
          glowColor: 'rgba(122, 218, 114, 0.3)'
        };
    }
  };

  const statusData = getStatusData();

  // Status selector animation calculations
  const translateY = statusSelectorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = statusSelectorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleMenuPress = () => {
    Alert.alert('Menu', 'Menu options will be displayed here');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <BackButton onPress={() => {}} />
        <Text style={styles.topBarTitle}>Profile</Text>
        <MenuButton onPress={handleMenuPress} color="#6C5CE7" />
      </View>
      
      <ScrollableContentContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Section */}
        <View style={styles.statusSection}>
          <TouchableOpacity 
            style={[
              styles.onlineStatusContainer,
              { width: userStatus === STATUS_TYPES.BUSY ? 170 : userStatus === STATUS_TYPES.OFFLINE ? 180 : 140 }
            ]}
            onPress={showStatusMenu}
            activeOpacity={0.7}
          >
            <View style={styles.onlineStatusIconContainer}>
              <View 
                style={[
                  styles.onlineStatusIconOuterGlow,
                  { backgroundColor: statusData.glowColor }
                ]} 
              />
              <View 
                style={[
                  styles.onlineStatusIcon,
                  { backgroundColor: statusData.color }
                ]}
              >
                {userStatus === STATUS_TYPES.BUSY && (
                  <View style={styles.busyIndicator}>
                    <Feather name="slash" size={18} color="#FFFFFF" />
                  </View>
                )}
                {userStatus === STATUS_TYPES.OFFLINE && (
                  <View style={styles.offlineIndicator}>
                    <Feather name="eye-off" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>
            <View>
              <Text style={styles.onlineText}>{statusData.text}</Text>
              <Text style={styles.onlineSubtext}>{statusData.subtext}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={navigateToAccount}
            >
              <View style={styles.actionCircle}>
                <Feather name="settings" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Account</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(156, 132, 239, 0.3)', 'rgba(244, 127, 255, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCardGradient}
          >
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
                style={styles.profileImage}
              />
              <LinearGradient
                colors={['rgba(156, 132, 239, 1)', 'rgba(244, 127, 255, 1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileImageBorder}
              />
            </View>
            
            <Text style={styles.profileCardName}>Sophia Jack</Text>
            <View style={styles.profileBadgeContainer}>
              <LinearGradient
                colors={['#5865F2', '#4164B1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileBadge}
              >
                <Text style={styles.profileBadgeText}>Premium</Text>
              </LinearGradient>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileBadge}
              >
                <Text style={styles.profileBadgeText}>Verified</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.profileUsername}>@Sophia93</Text>
          </LinearGradient>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['Photos', 'Activity', 'Friends'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => handleTabChange(tab.toLowerCase())}
              style={[
                styles.tab,
                activeTab === tab.toLowerCase() && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.toLowerCase() && styles.activeTabText
              ]}>
                {tab}
              </Text>
              {activeTab === tab.toLowerCase() && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Photos Tab Content */}
        {activeTab === 'photos' && (
          <View style={styles.photoSection}>
            {/* Photos Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Photos (3)</Text>
              <TouchableOpacity>
                <LinearGradient
                  colors={['#7872F4', '#5865F2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.previewButton}
                >
                  <Text style={styles.previewButtonText}>Preview</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* Photos Grid */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photosContainer}
              contentContainerStyle={styles.photosContent}
            >
              <TouchableOpacity>
                <LinearGradient
                  colors={['#6E69F4', '#9C84EF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addPhotoButton}
                >
                  <View style={styles.addPhotoIconContainer}>
                    <AntDesign name="plus" size={32} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              {[32, 33, 34].map((id) => (
                <TouchableOpacity key={id} style={styles.photoItemContainer}>
                  <Image 
                    source={{ uri: `https://randomuser.me/api/portraits/women/${id}.jpg` }} 
                    style={styles.photoItem}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.photoGradient}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Gem+ Section */}
        <View style={styles.gemSection}>
          <LinearGradient
            colors={['#272931', '#1E1F25']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gemIconContainer}
          >
            <LinearGradient
              colors={['#9C84EF', '#F47FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gemIcon}
            >
              <MaterialCommunityIcons name="diamond-stone" size={24} color="#FFFFFF" />
            </LinearGradient>
          </LinearGradient>
          
          <LinearGradient
            colors={['#272931', '#1E1F25']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gemInfoContainer}
          >
            <Text style={styles.gemLabel}>Gem+</Text>
            <View style={styles.inactiveButton}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
            <TouchableOpacity>
              <LinearGradient
                colors={['#6E69F4', '#5865F2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buyButton}
              >
                <Text style={styles.buyText}>Buy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Profile Views & Currency Section */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#5865F2', '#4164B1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.profileViewsContainer}
          >
            <View style={styles.profileViewsContent}>
              <Ionicons name="eye-outline" size={20} color="#FFFFFF" style={styles.viewsIcon} />
              <Text style={styles.profileViewsText}>Profile Views</Text>
            </View>
            <View style={styles.viewsCountContainer}>
              <Text style={styles.viewsCount}>3456</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.currencySection}>
            {/* Diamond currency */}
            <LinearGradient
              colors={['#32353B', '#2B2E33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.currencyRow}
            >
              <LinearGradient
                colors={['#9C84EF', '#F47FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.currencyIconContainer}
              >
                <MaterialCommunityIcons name="diamond-stone" size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.currencyValue}>200 012</Text>
              <LinearGradient
                colors={['#6E69F4', '#5865F2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.addCurrencyButton}
              >
                <AntDesign name="plus" size={14} color="#FFFFFF" />
              </LinearGradient>
            </LinearGradient>
            
            {/* Gold currency */}
            <LinearGradient
              colors={['#32353B', '#2B2E33']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.currencyRow}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.currencyIconContainer}
              >
                <FontAwesome name="circle" size={14} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.currencyValue}>43 978</Text>
              <LinearGradient
                colors={['#6E69F4', '#5865F2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.addCurrencyButton}
              >
                <AntDesign name="plus" size={14} color="#FFFFFF" />
              </LinearGradient>
            </LinearGradient>
          </View>
        </View>
        
        {/* Profile Info Section */}
        <View style={styles.profileInfoSection}>
          <LinearGradient
            colors={['#1C1D23', '#15151A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.profileInfoContainer}
          >
            <View style={styles.profileInfoHeader}>
              <Text style={styles.profileName}>Sophia Jack</Text>
              <TouchableOpacity style={styles.editProfileButton}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.usernameRow}>
              <Text style={styles.profileUsername}>Sophia93</Text>
              <View style={styles.profileVerifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#7ADA72" />
              </View>
            </View>
            
            <Text style={styles.fieldLabel}>Display Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value="Sophia Jack"
                placeholderTextColor="#FFFFFF"
              />
              <TouchableOpacity style={styles.clearButton}>
                <AntDesign name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.bioHeader}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TouchableOpacity 
                onPress={toggleBioExpanded}
                style={styles.expandButton}
              >
                <Text style={styles.expandButtonText}>
                  {showBioExpanded ? 'Collapse' : 'Expand'}
                </Text>
                <Feather 
                  name={showBioExpanded ? "chevron-up" : "chevron-down"} 
                  size={14} 
                  color="#9597A3" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={[
              styles.bioInputContainer,
              showBioExpanded && styles.bioInputContainerExpanded
            ]}>
              <TextInput
                style={styles.bioInput}
                placeholder="Write about your self"
                placeholderTextColor="#B8B8B8"
                multiline
              />
            </View>
          </LinearGradient>
        </View>
        
        {/* Friends Section */}
        <TouchableOpacity>
          <LinearGradient
            colors={['#1C1D23', '#15151A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.friendsSection}
          >
            <View style={styles.friendsSectionLeft}>
              <Text style={styles.friendsText}>Your Friends</Text>
              <View style={styles.friendsCountBadge}>
                <Text style={styles.friendsCountText}>48</Text>
              </View>
            </View>
            <View style={styles.friendsArrowContainer}>
              <Feather name="chevron-right" size={16} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Spacing for bottom of screen */}
        <View style={{ height: 70 }} />
      </ScrollableContentContainer>

      {/* Status Selector Modal */}
      <Modal
        visible={showStatusSelector}
        transparent
        animationType="none"
        onRequestClose={hideStatusMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideStatusMenu}
        >
          <Animated.View 
            style={[
              styles.statusSelectorContainer,
              {
                transform: [{ translateY }],
                opacity,
              }
            ]}
          >
            <View style={styles.statusSelectorHandle} />
            <Text style={styles.statusSelectorTitle}>Set Status</Text>
            
            <TouchableOpacity 
              style={styles.statusOption}
              onPress={() => changeStatus(STATUS_TYPES.ONLINE)}
            >
              <View style={[styles.statusOptionIcon, { backgroundColor: '#7ADA72' }]}>
                <View style={styles.statusOptionIconInner} />
              </View>
              <View style={styles.statusOptionTextContainer}>
                <Text style={styles.statusOptionTitle}>Online</Text>
                <Text style={styles.statusOptionSubtitle}>Active Now</Text>
              </View>
              {userStatus === STATUS_TYPES.ONLINE && (
                <View style={styles.statusOptionSelected}>
                  <AntDesign name="check" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statusOption}
              onPress={() => changeStatus(STATUS_TYPES.BUSY)}
            >
              <View style={[styles.statusOptionIcon, { backgroundColor: '#E57373' }]}>
                <Feather name="slash" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.statusOptionTextContainer}>
                <Text style={styles.statusOptionTitle}>Busy</Text>
                <Text style={styles.statusOptionSubtitle}>Do Not Disturb</Text>
              </View>
              {userStatus === STATUS_TYPES.BUSY && (
                <View style={styles.statusOptionSelected}>
                  <AntDesign name="check" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statusOption}
              onPress={() => changeStatus(STATUS_TYPES.OFFLINE)}
            >
              <View style={[styles.statusOptionIcon, { backgroundColor: '#35383F' }]}>
                <Feather name="eye-off" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.statusOptionTextContainer}>
                <Text style={styles.statusOptionTitle}>Offline</Text>
                <Text style={styles.statusOptionSubtitle}>Invisible to Others</Text>
              </View>
              {userStatus === STATUS_TYPES.OFFLINE && (
                <View style={styles.statusOptionSelected}>
                  <AntDesign name="check" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1D23',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topBar: {
    height: Platform.OS === 'ios' ? 91 : 70,
    backgroundColor: 'rgba(22, 24, 28, 0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 57, 65, 0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  topBarTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    paddingTop: Platform.OS === 'ios' ? 44 : 10,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#1C1D23',
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292B31',
    borderRadius: 12,
    padding: 3,
    height: 48,
    paddingRight: 10,
  },
  onlineStatusIconContainer: {
    position: 'relative',
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineStatusIconOuterGlow: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(122, 218, 114, 0.3)',
  },
  onlineStatusIcon: {
    width: 38,
    height: 38,
    backgroundColor: '#7ADA72',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#15151A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busyIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineText: {
    marginLeft: 15,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineSubtext: {
    marginLeft: 15,
    color: '#A8B3BD',
    fontSize: 12,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 55,
  },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(54, 57, 63, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
  profileCard: {
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileCardGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  profileImageBorder: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileCardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  profileBadgeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  profileBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profileUsername: {
    color: '#A8B3BD',
    fontSize: 16,
    fontWeight: '400',
    marginRight: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 15,
    backgroundColor: 'rgba(30, 31, 37, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(156, 132, 239, 0.2)',
  },
  tabText: {
    color: '#9597A3',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9C84EF',
  },
  photoSection: {
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#1C1D23',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
  },
  previewButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  photosContainer: {
    backgroundColor: '#1C1D23',
    paddingVertical: 14,
  },
  photosContent: {
    paddingHorizontal: 12,
    gap: 15,
  },
  addPhotoButton: {
    width: 83,
    height: 126,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoItemContainer: {
    width: 83,
    height: 126,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoItem: {
    width: 83,
    height: 126,
    borderRadius: 12,
  },
  photoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  gemSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#1C1D23',
    gap: 16,
  },
  gemIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gemIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gemInfoContainer: {
    flex: 1,
    height: 65,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  gemLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  inactiveButton: {
    backgroundColor: '#535864',
    borderRadius: 20.5,
    paddingVertical: 4,
    paddingHorizontal: 13,
    marginLeft: 10,
  },
  inactiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  buyButton: {
    borderRadius: 20.5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginLeft: 'auto',
  },
  buyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#1C1D23',
  },
  profileViewsContainer: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 15,
  },
  profileViewsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  viewsIcon: {
    marginRight: 10,
  },
  profileViewsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  viewsCountContainer: {
    width: 60,
    height: 48,
    backgroundColor: '#4164B1',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
  },
  viewsCount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  currencySection: {
    gap: 12,
  },
  currencyRow: {
    height: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  currencyIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyValue: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  addCurrencyButton: {
    width: 22,
    height: 24,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfoSection: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#1C1D23',
    marginTop: 10,
  },
  profileInfoContainer: {
    borderRadius: 15,
    padding: 20,
  },
  profileInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  editProfileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileVerifiedBadge: {
    backgroundColor: 'rgba(122, 218, 114, 0.1)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    color: '#A8B3BD',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    height: 54,
    backgroundColor: 'rgba(28, 29, 35, 0.7)',
    borderRadius: 10,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 12,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandButtonText: {
    color: '#9597A3',
    fontSize: 12,
    fontWeight: '500',
  },
  bioInputContainer: {
    height: 100,
    backgroundColor: 'rgba(28, 29, 35, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  bioInputContainerExpanded: {
    height: 150,
  },
  bioInput: {
    flex: 1,
    color: '#B8B8B8',
    fontSize: 14,
    fontWeight: '400',
    textAlignVertical: 'top',
  },
  friendsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: 'rgba(21, 21, 26, 0.7)',
    borderRadius: 15,
    padding: 18,
  },
  friendsSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  friendsCountBadge: {
    backgroundColor: 'rgba(156, 132, 239, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  friendsCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  friendsArrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  statusSelectorContainer: {
    backgroundColor: '#1C1D23',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  statusSelectorHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#3E4148',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusSelectorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusOptionIconInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  statusOptionTextContainer: {
    flex: 1,
  },
  statusOptionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusOptionSubtitle: {
    color: '#A8B3BD',
    fontSize: 12,
    marginTop: 2,
  },
  statusOptionSelected: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen; 