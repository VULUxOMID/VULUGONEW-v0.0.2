import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Discord color palette
const COLORS = {
  background: '#36393F',
  backgroundDarker: '#2F3136',
  backgroundHeader: '#202225',
  textNormal: '#DCDDDE',
  textMuted: '#72767D',
  textBright: '#FFFFFF',
  accent: '#5865F2', // Discord blurple
  mentionBackground: 'rgba(88, 101, 242, 0.3)',
  mentionText: '#5865F2',
  divider: '#40444B',
  inputBackground: '#40444B',
  danger: '#ED4245',
  success: '#3BA55D',
  warning: '#FAA81A',
};

interface ChatScreenProps {
  userId: string;
  name: string;
  avatar: string;
  goBack: () => void;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isLive?: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'gif';
    url: string;
    filename?: string;
    width?: number;
    height?: number;
  }>;
  mentions?: Array<{
    id: string;
    name: string;
    startIndex: number;
    endIndex: number;
  }>;
  replyTo?: {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    userIds: string[];
  }>;
}

// Placeholder for current user info
const CURRENT_USER_ID = 'currentUser';
const CURRENT_USER_NAME = 'You';
const CURRENT_USER_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';

// Sample data with Discord-like features
const DUMMY_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'otherUser1',
    senderName: 'Sophia', 
    senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "Hey! How are you?",
    timestamp: '2:30 PM',
  },
  {
    id: '2',
    senderId: 'otherUser1',
    senderName: 'Sophia',
    senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "Did you check out the new features?",
    timestamp: '2:30 PM',
  },
  {
    id: '3',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    senderAvatar: CURRENT_USER_AVATAR,
    text: "I'm doing great! Just finished working on the new feature.",
    timestamp: '2:31 PM',
  },
  {
    id: '4',
    senderId: 'otherUser1', 
    senderName: 'Sophia',
    senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "That's awesome! Can't wait to see it 😊",
    timestamp: '2:32 PM',
    reactions: [
      { emoji: '👍', count: 1, userIds: [CURRENT_USER_ID] },
      { emoji: '🎉', count: 1, userIds: [CURRENT_USER_ID] }
    ]
  },
  {
    id: '5',
    senderId: 'otherUser1', 
    senderName: 'Sophia',
    senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "How did the testing go?",
    timestamp: '2:33 PM',
  },
  {
    id: '6',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    senderAvatar: CURRENT_USER_AVATAR,
    text: "I'll send you a demo soon. Here's a screenshot of what I've been working on:",
    timestamp: '2:35 PM',
    attachments: [
      {
        id: 'att1',
        type: 'image',
        url: 'https://picsum.photos/400/300',
        width: 400,
        height: 300
      }
    ]
  },
  {
    id: '7',
    senderId: 'otherUser1',
    senderName: 'Sophia',
    senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "Wow, that looks great! When can we test it?",
    timestamp: '2:36 PM',
    replyTo: {
      id: '6',
      senderId: CURRENT_USER_ID,
      senderName: CURRENT_USER_NAME,
      text: "I'll send you a demo soon. Here's a screenshot of what I've been working on:"
    }
  },
  {
    id: '8',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    senderAvatar: CURRENT_USER_AVATAR,
    text: "Hey @Sophia, I'm planning to start a live stream to showcase the features in about 10 minutes. Would you join?",
    timestamp: '2:37 PM',
    mentions: [
      {
        id: 'otherUser1',
        name: 'Sophia',
        startIndex: 4,
        endIndex: 11
      }
    ]
  },
  {
    id: '9',
    senderId: 'otherUser1',
    senderName: 'Sophia',
    senderAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "Sure! I'll be there.",
    timestamp: '2:38 PM',
  },
];

const DiscordChatScreen = ({ userId, name, avatar, goBack }: ChatScreenProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => 
    // Use chat partner details for initial non-currentUser messages
    DUMMY_MESSAGES.map(msg => 
      msg.senderId !== CURRENT_USER_ID ? { ...msg, senderName: name, senderAvatar: avatar } : msg
    )
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isAttachmentPickerVisible, setIsAttachmentPickerVisible] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [swipedMessageId, setSwipedMessageId] = useState<string | null>(null);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const inputContainerRef = useRef<View>(null);
  const swipeAnimRef = useRef<{ [key: string]: Animated.Value }>({});
  
  // Initialize swipe animations for each message
  useEffect(() => {
    const swipeAnims: { [key: string]: Animated.Value } = {};
    messages.forEach(msg => {
      if (!swipeAnimRef.current[msg.id]) {
        swipeAnims[msg.id] = new Animated.Value(0);
      }
    });
    swipeAnimRef.current = { ...swipeAnimRef.current, ...swipeAnims };
  }, [messages]);

  // Auto-scroll to bottom on mount and when messages change
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  // Function to detect mentions in the message
  const detectMentions = (text: string): Array<{id: string, name: string, startIndex: number, endIndex: number}> => {
    const mentions = [];
    // Simple regex to find @username patterns
    const mentionRegex = /@(\w+)/g;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const name = match[1];
      // In a real app, you would look up the user ID based on the username
      if (name.toLowerCase() === name.toLowerCase()) {
        mentions.push({
          id: 'otherUser1',
          name: name,
          startIndex: match.index,
          endIndex: match.index + match[0].length - 1
        });
      }
    }
    
    return mentions;
  };
  
  // Function to handle sending a message
  const sendMessage = () => {
    if (message.trim()) {
      // Detect mentions in the message
      const mentions = detectMentions(message);
      
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: CURRENT_USER_ID,
        senderName: CURRENT_USER_NAME,
        senderAvatar: CURRENT_USER_AVATAR,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...(mentions.length > 0 && { mentions }),
        ...(replyingTo && { 
          replyTo: {
            id: replyingTo.id,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderName,
            text: replyingTo.text
          } 
        })
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage('');
      setReplyingTo(null);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Function to handle replying to a message
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    textInputRef.current?.focus();
    // Reset any swiped message
    resetSwipedMessage();
  };
  
  // Function to add a reaction to a message
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          const existingReactionIndex = existingReactions.findIndex(r => r.emoji === emoji);
          
          if (existingReactionIndex >= 0) {
            // User already reacted with this emoji, toggle it off
            if (existingReactions[existingReactionIndex].userIds.includes(CURRENT_USER_ID)) {
              const updatedUserIds = existingReactions[existingReactionIndex].userIds.filter(id => id !== CURRENT_USER_ID);
              
              if (updatedUserIds.length === 0) {
                // Remove the reaction entirely if no users left
                return {
                  ...msg,
                  reactions: existingReactions.filter(r => r.emoji !== emoji)
                };
              }
              
              // Update the reaction with reduced count
              return {
                ...msg,
                reactions: existingReactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count - 1, userIds: updatedUserIds }
                    : r
                )
              };
            } else {
              // Add current user to existing reaction
              return {
                ...msg,
                reactions: existingReactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, userIds: [...r.userIds, CURRENT_USER_ID] }
                    : r
                )
              };
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...existingReactions, { emoji, count: 1, userIds: [CURRENT_USER_ID] }]
            };
          }
        }
        return msg;
      })
    );
    
    // Reset any swiped message
    resetSwipedMessage();
  };

  // Function to reset swiped message state
  const resetSwipedMessage = () => {
    if (swipedMessageId && swipeAnimRef.current[swipedMessageId]) {
      Animated.spring(swipeAnimRef.current[swipedMessageId], {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
        tension: 40
      }).start();
      setSwipedMessageId(null);
    }
  };

  // Function to create a pan responder for message swiping
  const createMessagePanResponder = (messageId: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
      },
      onPanResponderGrant: () => {
        // If another message is swiped, reset it
        resetSwipedMessage();
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow right swipe (positive dx)
        if (gestureState.dx > 0) {
          // Limit the swipe to 100 pixels
          const swipeValue = Math.min(gestureState.dx, 100);
          swipeAnimRef.current[messageId].setValue(swipeValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped more than 50px, snap to open position
        if (gestureState.dx > 50) {
          Animated.spring(swipeAnimRef.current[messageId], {
            toValue: 100,
            useNativeDriver: true,
            friction: 5,
            tension: 40
          }).start();
          setSwipedMessageId(messageId);
        } else {
          // Otherwise snap back to closed position
          Animated.spring(swipeAnimRef.current[messageId], {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
            tension: 40
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset to closed position if interaction is terminated
        Animated.spring(swipeAnimRef.current[messageId], {
          toValue: 0,
          useNativeDriver: true,
          friction: 5,
          tension: 40
        }).start();
      }
    });
  };

  // Helper function to render message text with mentions highlighted
  const renderMessageWithMentions = (text: string, mentions?: Array<{id: string, name: string, startIndex: number, endIndex: number}>) => {
    if (!mentions || mentions.length === 0) {
      return <Text style={styles.messageText}>{text}</Text>;
    }

    // Sort mentions by startIndex to process them in order
    const sortedMentions = [...mentions].sort((a, b) => a.startIndex - b.startIndex);
    
    const textParts = [];
    let lastIndex = 0;
    
    sortedMentions.forEach((mention, index) => {
      // Add text before the mention
      if (mention.startIndex > lastIndex) {
        textParts.push(
          <Text key={`text-${index}`} style={styles.messageText}>
            {text.substring(lastIndex, mention.startIndex)}
          </Text>
        );
      }
      
      // Add the mention with highlight styling
      textParts.push(
        <Text key={`mention-${index}`} style={styles.mentionText}>
          {text.substring(mention.startIndex, mention.endIndex + 1)}
        </Text>
      );
      
      lastIndex = mention.endIndex + 1;
    });
    
    // Add any remaining text after the last mention
    if (lastIndex < text.length) {
      textParts.push(
        <Text key={`text-last`} style={styles.messageText}>
          {text.substring(lastIndex)}
        </Text>
      );
    }
    
    return <Text>{textParts}</Text>;
  };

  // Helper function to render message reactions
  const renderReactions = (reactions?: Array<{emoji: string, count: number, userIds: string[]}>) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <View style={styles.reactionsContainer}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity 
            key={`${reaction.emoji}-${index}`} 
            style={[styles.reactionBubble, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionBubbleSelected]}
            onPress={() => handleAddReaction(swipedMessageId || '', reaction.emoji)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionCount, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionCountSelected]}>
              {reaction.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Helper function to render message attachments
  const renderAttachments = (attachments?: Array<{id: string, type: string, url: string, width?: number, height?: number}>) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment) => {
          if (attachment.type === 'image') {
            return (
              <TouchableOpacity key={attachment.id} style={styles.imageAttachmentContainer}>
                <Image 
                  source={{ uri: attachment.url }} 
                  style={[styles.imageAttachment, attachment.width && attachment.height ? 
                    { aspectRatio: attachment.width / attachment.height } : null]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }
          return null; // Handle other attachment types if needed
        })}
      </View>
    );
  };

  // Helper function to render reply reference
  const renderReplyReference = (replyTo?: {id: string, senderId: string, senderName: string, text: string}) => {
    if (!replyTo) return null;
    
    const isReplyToCurrentUser = replyTo.senderId === CURRENT_USER_ID;
    
    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={[styles.replyUsername, isReplyToCurrentUser && styles.currentUserName]}>
            {replyTo.senderName}
          </Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render a message item
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    // Grouping Logic
    const previousMessage = index > 0 ? messages[index - 1] : null;
    // Group if previous message exists and is from the same sender
    const isGrouped = previousMessage?.senderId === item.senderId;
    // Check if messages are within 5 minutes of each other
    const isWithinTimeWindow = (prev: string, current: string) => {
      const prevTime = new Date(`1/1/2023 ${prev}`);
      const currTime = new Date(`1/1/2023 ${current}`);
      return (currTime.getTime() - prevTime.getTime()) < 5 * 60 * 1000; // 5 minutes in milliseconds
    };

    // Only group if messages are from same sender AND within time window
    const shouldGroup = isGrouped && 
      (!previousMessage?.timestamp || isWithinTimeWindow(previousMessage.timestamp, item.timestamp));

    const showHeader = !shouldGroup;
    const isCurrentUser = item.senderId === CURRENT_USER_ID;

    // Don't group if the message has a reply (Discord behavior)
    const hasReply = !!item.replyTo;
    
    // Create a pan responder for this message if it doesn't exist
    if (!swipeAnimRef.current[item.id]) {
      swipeAnimRef.current[item.id] = new Animated.Value(0);
    }
    
    const messagePanResponder = createMessagePanResponder(item.id);
    
    // Calculate transform based on swipe animation
    const messageTransform = {
      transform: [{ translateX: swipeAnimRef.current[item.id] }]
    };
    
    // Calculate opacity for action buttons (appear as message swipes)
    const actionsOpacity = swipeAnimRef.current[item.id].interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={styles.messageWrapper}>
        {/* Action buttons that appear on swipe */}
        <Animated.View style={[styles.messageActions, { opacity: actionsOpacity }]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReply(item)}
          >
            <MaterialIcons name="reply" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddReaction(item.id, '👍')}
          >
            <MaterialIcons name="add-reaction" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="more-vert" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Swipeable message container */}
        <Animated.View 
          style={[messageTransform, styles.messageContainer]}
          {...messagePanResponder.panHandlers}
        >
          <View style={[
            styles.discordMessageContainer,
            (showHeader || hasReply) && styles.discordMessageGroupStart,
            isCurrentUser && styles.currentUserMessage
          ]}>
            {(showHeader || hasReply) ? (
              <Image 
                source={{ uri: item.senderAvatar }}
                style={styles.discordAvatar}
              />
            ) : (
              <View style={styles.discordAvatarPlaceholder} />
            )}
            <View style={[styles.discordMessageContent, isCurrentUser && styles.currentUserMessageContent]}>
              {(showHeader || hasReply) && (
                <View style={styles.discordMessageHeader}>
                  <Text style={[styles.discordUsername, isCurrentUser && styles.currentUserName]}>
                    {item.senderName}
                  </Text>
                  <Text style={styles.discordTimestamp}>{item.timestamp}</Text>
                </View>
              )}
               
              {/* Reply reference */}
              {renderReplyReference(item.replyTo)}
               
              <View style={[
                styles.messageBubble,
                isCurrentUser && styles.currentUserBubble,
                !showHeader && !hasReply && styles.groupedMessageBubble
              ]}>
                {/* Message text with mentions */}
                {renderMessageWithMentions(item.text, item.mentions)}
                
                {/* Attachments */}
                {renderAttachments(item.attachments)}
              </View>
              
              {/* Reactions */}
              {renderReactions(item.reactions)}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Render the header
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textBright} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="call" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="videocam" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 70}
        style={styles.keyboardContainer}
        enabled
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            onScroll={() => resetSwipedMessage()} // Reset swiped message when scrolling
          />
          
          {/* Input container with Discord-like styling and features */}
          <View style={styles.inputContainerWrapper} ref={inputContainerRef}>
            {/* Reply interface */}
            {replyingTo && (
              <View style={styles.replyingContainer}>
                <View style={styles.replyingContent}>
                  <View style={styles.replyingBar} />
                  <View style={styles.replyingTextContainer}>
                    <Text style={styles.replyingToText}>Replying to </Text>
                    <Text style={styles.replyingToName}>{replyingTo.senderName}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeReplyButton} onPress={() => setReplyingTo(null)}>
                  <MaterialIcons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Discord-style input area */}
            // Discord-style input container
            <View style={styles.discordInputContainer}>
              {/* Left side buttons */}
              <View style={styles.discordInputLeftButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsAttachmentPickerVisible(!isAttachmentPickerVisible);
                    setIsEmojiPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="add" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              {/* Input field */}
              <View style={styles.discordInputFieldContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.discordInputField}
                  placeholder={`Message ${name}`}
                  placeholderTextColor={COLORS.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  multiline
                />
              </View>
              
              {/* Right side buttons */}
              <View style={styles.discordInputRightButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsEmojiPickerVisible(!isEmojiPickerVisible);
                    setIsAttachmentPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="emoji-emotions" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
                {message.trim().length > 0 && (
                  <TouchableOpacity 
                    style={[styles.discordInputButton, styles.sendButton]}
                    onPress={sendMessage}
                  >
                    <MaterialIcons name="send" size={22} color={COLORS.textBright} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* Discord-style input container */}
            discordInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: COLORS.background,
              borderTopWidth: 1,
              borderTopColor: COLORS.divider,
            },
            discordInputLeftButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputRightButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputButton: {
              width: 28,
              height: 28,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 2,
            },
            discordInputFieldContainer: {
              flex: 1,
              backgroundColor: COLORS.inputBackground,
              borderRadius: 8,
              marginHorizontal: 4,
              paddingHorizontal: 8,
              minHeight: 32,
              maxHeight: 80,
              justifyContent: 'center',
            },
            discordInputField: {
              color: COLORS.textNormal,
              fontSize: 14,
              paddingVertical: Platform.OS === 'ios' ? 6 : 2,
              maxHeight: 80,
            },
            sendButton: {
              backgroundColor: COLORS.accent,
            },
          {...(replyingTo && { 
            replyTo: {
              id: replyingTo.id,
              senderId: replyingTo.senderId,
              senderName: replyingTo.senderName,
              text: replyingTo.text
            } 
          })
      };
      
      setMessage('');
      setReplyingTo(null);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Helper function to render message reactions
  const renderReactions = (reactions?: Array<{emoji: string, count: number, userIds: string[]}>) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <View style={styles.reactionsContainer}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity 
            key={`${reaction.emoji}-${index}`} 
            style={[styles.reactionBubble, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionBubbleSelected]}
            onPress={() => handleAddReaction(swipedMessageId || '', reaction.emoji)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionCount, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionCountSelected]}>
              {reaction.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Helper function to render message attachments
  const renderAttachments = (attachments?: Array<{id: string, type: string, url: string, width?: number, height?: number}>) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment) => {
          if (attachment.type === 'image') {
            return (
              <TouchableOpacity key={attachment.id} style={styles.imageAttachmentContainer}>
                <Image 
                  source={{ uri: attachment.url }} 
                  style={[styles.imageAttachment, attachment.width && attachment.height ? 
                    { aspectRatio: attachment.width / attachment.height } : null]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }
          return null; // Handle other attachment types if needed
        })}
      </View>
    );
  };

  // Helper function to render reply reference
  const renderReplyReference = (replyTo?: {id: string, senderId: string, senderName: string, text: string}) => {
    if (!replyTo) return null;
    
    const isReplyToCurrentUser = replyTo.senderId === CURRENT_USER_ID;
    
    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={[styles.replyUsername, isReplyToCurrentUser && styles.currentUserName]}>
            {replyTo.senderName}
          </Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render a message item
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    // Grouping Logic
    const previousMessage = index > 0 ? messages[index - 1] : null;
    // Group if previous message exists and is from the same sender
    const isGrouped = previousMessage?.senderId === item.senderId;
    // Check if messages are within 5 minutes of each other
    const isWithinTimeWindow = (prev: string, current: string) => {
      const prevTime = new Date(`1/1/2023 ${prev}`);
      const currTime = new Date(`1/1/2023 ${current}`);
      return (currTime.getTime() - prevTime.getTime()) < 5 * 60 * 1000; // 5 minutes in milliseconds
    };

    // Only group if messages are from same sender AND within time window
    const shouldGroup = isGrouped && 
      (!previousMessage?.timestamp || isWithinTimeWindow(previousMessage.timestamp, item.timestamp));

    const showHeader = !shouldGroup;
    const isCurrentUser = item.senderId === CURRENT_USER_ID;

    // Don't group if the message has a reply (Discord behavior)
    const hasReply = !!item.replyTo;
    
    // Create a pan responder for this message if it doesn't exist
    if (!swipeAnimRef.current[item.id]) {
      swipeAnimRef.current[item.id] = new Animated.Value(0);
    }
    
    const messagePanResponder = createMessagePanResponder(item.id);
    
    // Calculate transform based on swipe animation
    const messageTransform = {
      transform: [{ translateX: swipeAnimRef.current[item.id] }]
    };
    
    // Calculate opacity for action buttons (appear as message swipes)
    const actionsOpacity = swipeAnimRef.current[item.id].interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={styles.messageWrapper}>
        {/* Action buttons that appear on swipe */}
        <Animated.View style={[styles.messageActions, { opacity: actionsOpacity }]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReply(item)}
          >
            <MaterialIcons name="reply" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddReaction(item.id, '👍')}
          >
            <MaterialIcons name="add-reaction" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="more-vert" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Swipeable message container */}
        <Animated.View 
          style={[messageTransform, styles.messageContainer]}
          {...messagePanResponder.panHandlers}
        >
          <View style={[
            styles.discordMessageContainer,
            (showHeader || hasReply) && styles.discordMessageGroupStart,
            isCurrentUser && styles.currentUserMessage
          ]}>
            {(showHeader || hasReply) ? (
              <Image 
                source={{ uri: item.senderAvatar }}
                style={styles.discordAvatar}
              />
            ) : (
              <View style={styles.discordAvatarPlaceholder} />
            )}
            <View style={[styles.discordMessageContent, isCurrentUser && styles.currentUserMessageContent]}>
              {(showHeader || hasReply) && (
                <View style={styles.discordMessageHeader}>
                  <Text style={[styles.discordUsername, isCurrentUser && styles.currentUserName]}>
                    {item.senderName}
                  </Text>
                  <Text style={styles.discordTimestamp}>{item.timestamp}</Text>
                </View>
              )}
               
              {/* Reply reference */}
              {renderReplyReference(item.replyTo)}
               
              <View style={[
                styles.messageBubble,
                isCurrentUser && styles.currentUserBubble,
                !showHeader && !hasReply && styles.groupedMessageBubble
              ]}>
                {/* Message text with mentions */}
                {renderMessageWithMentions(item.text, item.mentions)}
                
                {/* Attachments */}
                {renderAttachments(item.attachments)}
              </View>
              
              {/* Reactions */}
              {renderReactions(item.reactions)}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Render the header
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textBright} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="call" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="videocam" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 70}
        style={styles.keyboardContainer}
        enabled
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            onScroll={() => resetSwipedMessage()} // Reset swiped message when scrolling
          />
          
          {/* Input container with Discord-like styling and features */}
          <View style={styles.inputContainerWrapper} ref={inputContainerRef}>
            {/* Reply interface */}
            {replyingTo && (
              <View style={styles.replyingContainer}>
                <View style={styles.replyingContent}>
                  <View style={styles.replyingBar} />
                  <View style={styles.replyingTextContainer}>
                    <Text style={styles.replyingToText}>Replying to </Text>
                    <Text style={styles.replyingToName}>{replyingTo.senderName}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeReplyButton} onPress={() => setReplyingTo(null)}>
                  <MaterialIcons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Discord-style input area */}
            <View style={styles.discordInputContainer}>
              {/* Left side buttons */}
              <View style={styles.discordInputLeftButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsAttachmentPickerVisible(!isAttachmentPickerVisible);
                    setIsEmojiPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="add" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              {/* Input field */}
              <View style={styles.discordInputFieldContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.discordInputField}
                  placeholder={`Message ${name}`}
                  placeholderTextColor={COLORS.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                />
              </View>
              
              {/* Right side buttons */}
              <View style={styles.discordInputRightButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsEmojiPickerVisible(!isEmojiPickerVisible);
                    setIsAttachmentPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="emoji-emotions" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                {message.trim().length > 0 && (
                  <TouchableOpacity 
                    style={[styles.discordInputButton, styles.sendButton]}
                    onPress={sendMessage}
                  >
                    <MaterialIcons name="send" size={20} color={COLORS.textBright} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* Discord-style input container */}
            discordInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: COLORS.background,
              borderTopWidth: 1,
              borderTopColor: COLORS.divider,
            },
            discordInputLeftButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputRightButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputButton: {
              width: 28,
              height: 28,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 2,
            },
            discordInputFieldContainer: {
              flex: 1,
              backgroundColor: COLORS.inputBackground,
              borderRadius: 8,
              marginHorizontal: 4,
              paddingHorizontal: 8,
              minHeight: 32,
              maxHeight: 80,
              justifyContent: 'center',
            },
            discordInputField: {
              color: COLORS.textNormal,
              fontSize: 14,
              paddingVertical: Platform.OS === 'ios' ? 6 : 2,
              maxHeight: 80,
            },
            sendButton: {
              backgroundColor: COLORS.accent,
            },
          {...(replyingTo && { 
            replyTo: {
              id: replyingTo.id,
              senderId: replyingTo.senderId,
              senderName: replyingTo.senderName,
              text: replyingTo.text
            } 
          })
      };
      
      setMessage('');
      setReplyingTo(null);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Helper function to render message reactions
  const renderReactions = (reactions?: Array<{emoji: string, count: number, userIds: string[]}>) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <View style={styles.reactionsContainer}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity 
            key={`${reaction.emoji}-${index}`} 
            style={[styles.reactionBubble, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionBubbleSelected]}
            onPress={() => handleAddReaction(swipedMessageId || '', reaction.emoji)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionCount, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionCountSelected]}>
              {reaction.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Helper function to render message attachments
  const renderAttachments = (attachments?: Array<{id: string, type: string, url: string, width?: number, height?: number}>) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment) => {
          if (attachment.type === 'image') {
            return (
              <TouchableOpacity key={attachment.id} style={styles.imageAttachmentContainer}>
                <Image 
                  source={{ uri: attachment.url }} 
                  style={[styles.imageAttachment, attachment.width && attachment.height ? 
                    { aspectRatio: attachment.width / attachment.height } : null]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }
          return null; // Handle other attachment types if needed
        })}
      </View>
    );
  };

  // Helper function to render reply reference
  const renderReplyReference = (replyTo?: {id: string, senderId: string, senderName: string, text: string}) => {
    if (!replyTo) return null;
    
    const isReplyToCurrentUser = replyTo.senderId === CURRENT_USER_ID;
    
    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={[styles.replyUsername, isReplyToCurrentUser && styles.currentUserName]}>
            {replyTo.senderName}
          </Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render a message item
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    // Grouping Logic
    const previousMessage = index > 0 ? messages[index - 1] : null;
    // Group if previous message exists and is from the same sender
    const isGrouped = previousMessage?.senderId === item.senderId;
    // Check if messages are within 5 minutes of each other
    const isWithinTimeWindow = (prev: string, current: string) => {
      const prevTime = new Date(`1/1/2023 ${prev}`);
      const currTime = new Date(`1/1/2023 ${current}`);
      return (currTime.getTime() - prevTime.getTime()) < 5 * 60 * 1000; // 5 minutes in milliseconds
    };

    // Only group if messages are from same sender AND within time window
    const shouldGroup = isGrouped && 
      (!previousMessage?.timestamp || isWithinTimeWindow(previousMessage.timestamp, item.timestamp));

    const showHeader = !shouldGroup;
    const isCurrentUser = item.senderId === CURRENT_USER_ID;

    // Don't group if the message has a reply (Discord behavior)
    const hasReply = !!item.replyTo;
    
    // Create a pan responder for this message if it doesn't exist
    if (!swipeAnimRef.current[item.id]) {
      swipeAnimRef.current[item.id] = new Animated.Value(0);
    }
    
    const messagePanResponder = createMessagePanResponder(item.id);
    
    // Calculate transform based on swipe animation
    const messageTransform = {
      transform: [{ translateX: swipeAnimRef.current[item.id] }]
    };
    
    // Calculate opacity for action buttons (appear as message swipes)
    const actionsOpacity = swipeAnimRef.current[item.id].interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={styles.messageWrapper}>
        {/* Action buttons that appear on swipe */}
        <Animated.View style={[styles.messageActions, { opacity: actionsOpacity }]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReply(item)}
          >
            <MaterialIcons name="reply" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddReaction(item.id, '👍')}
          >
            <MaterialIcons name="add-reaction" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="more-vert" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Swipeable message container */}
        <Animated.View 
          style={[messageTransform, styles.messageContainer]}
          {...messagePanResponder.panHandlers}
        >
          <View style={[
            styles.discordMessageContainer,
            (showHeader || hasReply) && styles.discordMessageGroupStart,
            isCurrentUser && styles.currentUserMessage
          ]}>
            {(showHeader || hasReply) ? (
              <Image 
                source={{ uri: item.senderAvatar }}
                style={styles.discordAvatar}
              />
            ) : (
              <View style={styles.discordAvatarPlaceholder} />
            )}
            <View style={[styles.discordMessageContent, isCurrentUser && styles.currentUserMessageContent]}>
              {(showHeader || hasReply) && (
                <View style={styles.discordMessageHeader}>
                  <Text style={[styles.discordUsername, isCurrentUser && styles.currentUserName]}>
                    {item.senderName}
                  </Text>
                  <Text style={styles.discordTimestamp}>{item.timestamp}</Text>
                </View>
              )}
               
              {/* Reply reference */}
              {renderReplyReference(item.replyTo)}
               
              <View style={[
                styles.messageBubble,
                isCurrentUser && styles.currentUserBubble,
                !showHeader && !hasReply && styles.groupedMessageBubble
              ]}>
                {/* Message text with mentions */}
                {renderMessageWithMentions(item.text, item.mentions)}
                
                {/* Attachments */}
                {renderAttachments(item.attachments)}
              </View>
              
              {/* Reactions */}
              {renderReactions(item.reactions)}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Render the header
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textBright} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="call" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="videocam" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 70}
        style={styles.keyboardContainer}
        enabled
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            onScroll={() => resetSwipedMessage()} // Reset swiped message when scrolling
          />
          
          {/* Input container with Discord-like styling and features */}
          <View style={styles.inputContainerWrapper} ref={inputContainerRef}>
            {/* Reply interface */}
            {replyingTo && (
              <View style={styles.replyingContainer}>
                <View style={styles.replyingContent}>
                  <View style={styles.replyingBar} />
                  <View style={styles.replyingTextContainer}>
                    <Text style={styles.replyingToText}>Replying to </Text>
                    <Text style={styles.replyingToName}>{replyingTo.senderName}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeReplyButton} onPress={() => setReplyingTo(null)}>
                  <MaterialIcons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Discord-style input area */}
            <View style={styles.discordInputContainer}>
              {/* Left side buttons */}
              <View style={styles.discordInputLeftButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsAttachmentPickerVisible(!isAttachmentPickerVisible);
                    setIsEmojiPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="add" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              {/* Input field */}
              <View style={styles.discordInputFieldContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.discordInputField}
                  placeholder={`Message ${name}`}
                  placeholderTextColor={COLORS.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                />
              </View>
              
              {/* Right side buttons */}
              <View style={styles.discordInputRightButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsEmojiPickerVisible(!isEmojiPickerVisible);
                    setIsAttachmentPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="emoji-emotions" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                {message.trim().length > 0 && (
                  <TouchableOpacity 
                    style={[styles.discordInputButton, styles.sendButton]}
                    onPress={sendMessage}
                  >
                    <MaterialIcons name="send" size={20} color={COLORS.textBright} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* Discord-style input container */}
            discordInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: COLORS.background,
              borderTopWidth: 1,
              borderTopColor: COLORS.divider,
            },
            discordInputLeftButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputRightButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputButton: {
              width: 28,
              height: 28,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 2,
            },
            discordInputFieldContainer: {
              flex: 1,
              backgroundColor: COLORS.inputBackground,
              borderRadius: 8,
              marginHorizontal: 4,
              paddingHorizontal: 8,
              minHeight: 32,
              maxHeight: 80,
              justifyContent: 'center',
            },
            discordInputField: {
              color: COLORS.textNormal,
              fontSize: 14,
              paddingVertical: Platform.OS === 'ios' ? 6 : 2,
              maxHeight: 80,
            },
            sendButton: {
              backgroundColor: COLORS.accent,
            },
          {...(replyingTo && { 
            replyTo: {
              id: replyingTo.id,
              senderId: replyingTo.senderId,
              senderName: replyingTo.senderName,
              text: replyingTo.text
            } 
          })
      };
      
      setMessage('');
      setReplyingTo(null);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Helper function to render message reactions
  const renderReactions = (reactions?: Array<{emoji: string, count: number, userIds: string[]}>) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <View style={styles.reactionsContainer}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity 
            key={`${reaction.emoji}-${index}`} 
            style={[styles.reactionBubble, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionBubbleSelected]}
            onPress={() => handleAddReaction(swipedMessageId || '', reaction.emoji)}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionCount, reaction.userIds.includes(CURRENT_USER_ID) && styles.reactionCountSelected]}>
              {reaction.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Helper function to render message attachments
  const renderAttachments = (attachments?: Array<{id: string, type: string, url: string, width?: number, height?: number}>) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <View style={styles.attachmentsContainer}>
        {attachments.map((attachment) => {
          if (attachment.type === 'image') {
            return (
              <TouchableOpacity key={attachment.id} style={styles.imageAttachmentContainer}>
                <Image 
                  source={{ uri: attachment.url }} 
                  style={[styles.imageAttachment, attachment.width && attachment.height ? 
                    { aspectRatio: attachment.width / attachment.height } : null]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }
          return null; // Handle other attachment types if needed
        })}
      </View>
    );
  };

  // Helper function to render reply reference
  const renderReplyReference = (replyTo?: {id: string, senderId: string, senderName: string, text: string}) => {
    if (!replyTo) return null;
    
    const isReplyToCurrentUser = replyTo.senderId === CURRENT_USER_ID;
    
    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={[styles.replyUsername, isReplyToCurrentUser && styles.currentUserName]}>
            {replyTo.senderName}
          </Text>
          <Text style={styles.replyText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render a message item
  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    // Grouping Logic
    const previousMessage = index > 0 ? messages[index - 1] : null;
    // Group if previous message exists and is from the same sender
    const isGrouped = previousMessage?.senderId === item.senderId;
    // Check if messages are within 5 minutes of each other
    const isWithinTimeWindow = (prev: string, current: string) => {
      const prevTime = new Date(`1/1/2023 ${prev}`);
      const currTime = new Date(`1/1/2023 ${current}`);
      return (currTime.getTime() - prevTime.getTime()) < 5 * 60 * 1000; // 5 minutes in milliseconds
    };

    // Only group if messages are from same sender AND within time window
    const shouldGroup = isGrouped && 
      (!previousMessage?.timestamp || isWithinTimeWindow(previousMessage.timestamp, item.timestamp));

    const showHeader = !shouldGroup;
    const isCurrentUser = item.senderId === CURRENT_USER_ID;

    // Don't group if the message has a reply (Discord behavior)
    const hasReply = !!item.replyTo;
    
    // Create a pan responder for this message if it doesn't exist
    if (!swipeAnimRef.current[item.id]) {
      swipeAnimRef.current[item.id] = new Animated.Value(0);
    }
    
    const messagePanResponder = createMessagePanResponder(item.id);
    
    // Calculate transform based on swipe animation
    const messageTransform = {
      transform: [{ translateX: swipeAnimRef.current[item.id] }]
    };
    
    // Calculate opacity for action buttons (appear as message swipes)
    const actionsOpacity = swipeAnimRef.current[item.id].interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={styles.messageWrapper}>
        {/* Action buttons that appear on swipe */}
        <Animated.View style={[styles.messageActions, { opacity: actionsOpacity }]}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReply(item)}
          >
            <MaterialIcons name="reply" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddReaction(item.id, '👍')}
          >
            <MaterialIcons name="add-reaction" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="more-vert" size={20} color={COLORS.textBright} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Swipeable message container */}
        <Animated.View 
          style={[messageTransform, styles.messageContainer]}
          {...messagePanResponder.panHandlers}
        >
          <View style={[
            styles.discordMessageContainer,
            (showHeader || hasReply) && styles.discordMessageGroupStart,
            isCurrentUser && styles.currentUserMessage
          ]}>
            {(showHeader || hasReply) ? (
              <Image 
                source={{ uri: item.senderAvatar }}
                style={styles.discordAvatar}
              />
            ) : (
              <View style={styles.discordAvatarPlaceholder} />
            )}
            <View style={[styles.discordMessageContent, isCurrentUser && styles.currentUserMessageContent]}>
              {(showHeader || hasReply) && (
                <View style={styles.discordMessageHeader}>
                  <Text style={[styles.discordUsername, isCurrentUser && styles.currentUserName]}>
                    {item.senderName}
                  </Text>
                  <Text style={styles.discordTimestamp}>{item.timestamp}</Text>
                </View>
              )}
               
              {/* Reply reference */}
              {renderReplyReference(item.replyTo)}
               
              <View style={[
                styles.messageBubble,
                isCurrentUser && styles.currentUserBubble,
                !showHeader && !hasReply && styles.groupedMessageBubble
              ]}>
                {/* Message text with mentions */}
                {renderMessageWithMentions(item.text, item.mentions)}
                
                {/* Attachments */}
                {renderAttachments(item.attachments)}
              </View>
              
              {/* Reactions */}
              {renderReactions(item.reactions)}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Render the header
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textBright} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{name}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="call" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="videocam" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color={COLORS.textBright} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 70}
        style={styles.keyboardContainer}
        enabled
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            onScroll={() => resetSwipedMessage()} // Reset swiped message when scrolling
          />
          
          {/* Input container with Discord-like styling and features */}
          <View style={styles.inputContainerWrapper} ref={inputContainerRef}>
            {/* Reply interface */}
            {replyingTo && (
              <View style={styles.replyingContainer}>
                <View style={styles.replyingContent}>
                  <View style={styles.replyingBar} />
                  <View style={styles.replyingTextContainer}>
                    <Text style={styles.replyingToText}>Replying to </Text>
                    <Text style={styles.replyingToName}>{replyingTo.senderName}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeReplyButton} onPress={() => setReplyingTo(null)}>
                  <MaterialIcons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Discord-style input area */}
            <View style={styles.discordInputContainer}>
              {/* Left side buttons */}
              <View style={styles.discordInputLeftButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsAttachmentPickerVisible(!isAttachmentPickerVisible);
                    setIsEmojiPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="add" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              
              {/* Input field */}
              <View style={styles.discordInputFieldContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.discordInputField}
                  placeholder={`Message ${name}`}
                  placeholderTextColor={COLORS.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                />
              </View>
              
              {/* Right side buttons */}
              <View style={styles.discordInputRightButtons}>
                <TouchableOpacity 
                  style={styles.discordInputButton}
                  onPress={() => {
                    setIsEmojiPickerVisible(!isEmojiPickerVisible);
                    setIsAttachmentPickerVisible(false);
                  }}
                >
                  <MaterialIcons name="emoji-emotions" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                {message.trim().length > 0 && (
                  <TouchableOpacity 
                    style={[styles.discordInputButton, styles.sendButton]}
                    onPress={sendMessage}
                  >
                    <MaterialIcons name="send" size={20} color={COLORS.textBright} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* Discord-style input container */}
            discordInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: COLORS.background,
              borderTopWidth: 1,
              borderTopColor: COLORS.divider,
            },
            discordInputLeftButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputRightButtons: {
              flexDirection: 'row',
              alignItems: 'center',
            },
            discordInputButton: {
              width: 28,
              height: 28,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 2,
            },
            discordInputFieldContainer: {
              flex: 1,
              backgroundColor: COLORS.inputBackground,
              borderRadius: 8,
              marginHorizontal: 4,
              paddingHorizontal: 8,
              minHeight: 32,
              maxHeight: 80,
              justifyContent: 'center',
            },
            discordInputField: {
              color: COLORS.textNormal,
              fontSize: 14,
              paddingVertical: Platform.OS === 'ios' ? 6 : 2,
              maxHeight: 80,
            },
            sendButton: {
              backgroundColor: COLORS.accent,
            },
          {...(replyingTo && { 
            replyTo: {
              id: replyingTo.id,
              senderId: replyingTo.senderId,
              senderName: replyingTo.senderName,
              text: replyingTo.text
            } 
          })
      };
      
      setMessage('');
      setReplyingTo(null);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Helper function to render message reactions
  const renderReactions = (reactions?: Array<{emoji: string, count: number, userIds: string[]}>) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <View style={styles.reactionsContainer}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity 
            key={`${reaction.emoji}-${index}`} 
            style={[