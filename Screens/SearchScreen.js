import React from 'react';
import { Text, View,FlatList, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import db from '../config'

export default class Searchscreen extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search: ""
    };
  }

  searchTransactions= async(searchText) =>{  
    searchText = searchText.toLowerCase //Changing the textinput case
    var first_Alphabet = text.split("")[0] //To identify whether it is bookid or studentid 
          if (first_Alphabet[0] ==='B'){
            const transaction =  await db.collection("transactions").where('bookid','==',this.state.searchText).limit(5).get()
            transaction.docs.map((doc)=>{//This ll always be an array
              this.setState({
                allTransactions:[...this.state.allTransactions,doc.data()],//It is appending the doc data
                lastVisibleTransaction: doc
              })
            })
          }
          else if(first_Alphabet[0] === 'S'){
            const transaction = await db.collection('transactions').where('studentid','==',searchText).limit(5).get()
          transaction.docs.map((doc)=>{
         this.setState({
         allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction: doc 
         })
        })
          }
          console.log(this.state.lastVisibleTransaction)
        }

        searchTransactions= async() =>{  
          var searchText = searchText.toLowerCase //Changing the textinput case
          var first_Alphabet = text.split("")[0] //To identify whether it is bookid or studentid 
                if (first_Alphabet[0] ==='B'){
                  const transaction =  await db.collection("transactions").where('bookid','==',this.state.searchText).startAfter(this.state.lastVisibeTransaction).limit(5).get()
                  transaction.docs.map((doc)=>{//This ll always be an array
                    this.setState({
                      allTransactions:[...this.state.allTransactions,doc.data()],//It is appending the doc data
                      lastVisibleTransaction: doc
                    })
                  })
                }
                else if(first_Alphabet[0] === 'S'){
                  const transaction = await db.collection('transactions').where('studentid','==',searchText).startAfter(this.state.lastVisibeTransaction).limit(5).get()
                transaction.docs.map((doc)=>{
               this.setState({
               allTransactions:[...this.state.allTransactions,doc.data()],
              lastVisibleTransaction: doc 
               })
              })
                }
              }
          
              

    render() {
      return (
        <View style={styles.container}>
        <View style={styles.searchBar}>
      <TextInput 
        style ={styles.bar}
        placeholder = "Enter bookid or studentid" //Can type either bookid or studentid (To check who is the last person took the book so by typing the bookid we can see all the transactions done on the book)
        onChangeText={(text)=>{this.setState({search:text})}}/>
        <TouchableOpacity
          style = {styles.searchButton}
          onPress={()=>{this.searchTransactions(this.state.search)}}
        >
          <Text>Search</Text>
        </TouchableOpacity>
        </View>
        <FlatList
          data={this.state.allTransactions}
          keyExtractor= {(item, index)=> index.toString()}//extracts the data from the item which is in array, Since index usually fetch only the no. but key extractor expects in string so we have to convert the no to string
          renderItem={({item})=>( //To render the items
            <View style={{borderBottomWidth: 2}}>
              <Text>{"bookid: " + item.bookid}</Text>
              <Text>{"studentid: " + item.studentid}</Text>
              <Text>{"transactionType: " + item.transactionType}</Text>
              <Text>{"date: " + item.date.toDate()}</Text>
            </View>
          )}
          
          onEndReached ={()=>{
           this.fetchMore()  //Prop of flatlist i.e when i reach te end i want more transaction history
           } 
         } 
         onEndReachedThreshold={0.3}
        /> 
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })