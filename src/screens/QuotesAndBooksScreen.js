import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  ScrollView, Linking, Animated, Dimensions, Platform, SafeAreaView 
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const quotes = [
  { id: '1', text: "Believe in yourself! You're capable of great things.", author: "Unknown" },
  { id: '2', text: "Every day is a new opportunity to improve yourself.", author: "Unknown" },
  { id: '3', text: "Hardships often prepare people for extraordinary success.", author: "Unknown" },
  { id: '4', text: "Success doesn't come from what you do occasionally, but consistently.", author: "Unknown" },
];

const booksDatabase = {
  'self-development': [
    { id: '1', title: 'Atomic Habits', recap: 'Build good habits and break bad ones.', icon: 'brain', link: 'https://www.amazon.com/Atomic-Habits-James-Clear/dp/0735211299', category: 'Habit Formation' },
    { id: '2', title: 'The Power of Now', recap: 'Teaches living in the present moment.', icon: 'sun', link: 'https://www.amazon.com/Power-Now-Guide-Spiritual-Enlightenment/dp/1577314808', category: 'Mindfulness' },
  ],
  'business': [
    { id: '3', title: 'The Lean Startup', recap: 'Emphasizes efficiency and adaptability.', icon: 'chart-line', link: 'https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898', category: 'Entrepreneurship' },
    { id: '4', title: 'Start with Why', recap: 'Leadership and discovering your purpose.', icon: 'lightbulb', link: 'https://www.amazon.com/Start-Why-Leaders-Inspire-Everything/dp/1591846447', category: 'Leadership' },
  ],
  'psychology': [
    { id: '5', title: 'Thinking, Fast and Slow', recap: 'Explores two systems of thought.', icon: 'balance-scale', link: 'https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555', category: 'Cognitive Science' },
    { id: '6', title: 'Influence: The Psychology of Persuasion', recap: 'Science of persuasion.', icon: 'handshake', link: 'https://www.amazon.com/Influence-Psychology-Persuasion-Pre-Order/dp/006124189X', category: 'Social Psychology' },
  ],
};

const QuotesAndBooksScreen = ({ navigation }) => {
  const [interest, setInterest] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleInterestChange = (text) => setInterest(text);

  const handleSearchBooks = () => {
    const books = booksDatabase[interest.toLowerCase()];
    setFilteredBooks(books || []);
  };

  const handleRefreshQuote = () => {
    setQuoteIndex((quoteIndex + 1) % quotes.length);
  };

  const handleOpenBookLink = (url) => Linking.openURL(url);

  const renderBookCard = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 200}
      style={styles.bookCard}
    >
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.bookIconContainer}
      >
        <FontAwesome5 name={item.icon} size={24} color="#fff" />
      </LinearGradient>
      <View style={styles.bookContent}>
        <Text style={styles.bookCategory}>{item.category}</Text>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookRecap}>{item.recap}</Text>
        <TouchableOpacity 
          onPress={() => handleOpenBookLink(item.link)} 
          style={styles.bookLinkButton}
        >
          <Text style={styles.bookLinkText}>View on Amazon</Text>
          <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20', '#003300']}
        style={styles.gradient}
      >
        {/* Header with Back Button */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={800}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quotes & Books</Text>
          <View style={styles.headerRight} />
        </Animatable.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
        {/* Motivational Quote Section */}
        <Animatable.View 
          animation="fadeIn"
          style={styles.quoteContainer}
        >
          <MaterialCommunityIcons 
            name="format-quote-close" 
            size={32} 
            color="#fff" 
            style={styles.quoteIcon} 
          />
          <Text style={styles.quoteText}>{quotes[quoteIndex].text}</Text>
          <Text style={styles.quoteAuthor}>- {quotes[quoteIndex].author}</Text>
          <TouchableOpacity 
            onPress={handleRefreshQuote} 
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={20} color="#2E7D32" />
            <Text style={styles.refreshButtonText}>Next Quote</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Book Interest Input */}
        <Animatable.View 
          animation="fadeInUp"
          delay={200}
          style={[
            styles.inputContainer,
            searchFocused && styles.inputContainerFocused
          ]}
        >
          <Text style={styles.subtitle}>Find Books Based on Interest:</Text>
          <View style={styles.searchContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color="#fff" 
              style={styles.searchIcon} 
            />
            <TextInput
              style={styles.input}
              value={interest}
              onChangeText={handleInterestChange}
              placeholder="e.g. self-development, business, psychology"
              placeholderTextColor="rgba(255,255,255,0.5)"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </View>
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearchBooks}
          >
            <Text style={styles.searchButtonText}>Search Books</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Display Books if Available */}
        {filteredBooks.length > 0 && (
          <Animatable.View 
            animation="fadeInUp"
            delay={400}
            style={styles.booksContainer}
          >
            <Text style={styles.booksTitle}>Books for "{interest}":</Text>
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.id}
              renderItem={renderBookCard}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Animatable.View>
        )}

        {/* No Books Found Message */}
        {filteredBooks.length === 0 && interest !== '' && (
          <Animatable.View 
            animation="fadeIn"
            style={styles.noBooksContainer}
          >
            <Ionicons name="book-outline" size={40} color="#ff4444" />
            <Text style={styles.noBooksText}>
              No books found for "{interest}". Try another category.
            </Text>
          </Animatable.View>
        )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  quoteText: {
    color: '#fff',
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'Roboto',
    lineHeight: 30,
  },
  quoteAuthor: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 15,
  },
  quoteIcon: {
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  refreshButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  inputContainerFocused: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  searchButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  booksContainer: {
    marginTop: 30,
  },
  booksTitle: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  bookCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  bookIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bookContent: {
    flex: 1,
  },
  bookCategory: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  bookTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookRecap: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 10,
  },
  bookLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookLinkText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 5,
  },
  noBooksContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  noBooksText: {
    color: '#ff4444',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});

export default QuotesAndBooksScreen;
