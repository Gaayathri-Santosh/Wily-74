import React,{Component} from 'react';
import {TextInput,StyleSheet, Text, View, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import{BarCodeScanner} from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
  constructor(){
    super()
    this.state={
      hasCamPermission: null,
      scanned: false,
      scannedBookId: '',
      scannedStudentId:'',
      scannedData:"",
      buttonState: "normal",
      transactionMessage:''
    }
  }

  getCameraPermissions = async(id) => {
    //console.log('id', id)
    const{status} = await Permissions.askAsync(Permissions.CAMERA)
    //console.log('status:', status)
    this.setState({
      hasCamPermission: status === 'granted',
      buttonState:id,
      scanned:false
    })
  }

  handleBarCodeScanner = async({type, data})=>{
    const {buttonState} = this.state

    if(buttonState==="bookid"){
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal'
      });
    }
    else if(buttonState==="studentid"){
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal'
      });
    }
  }

  initiateBookIssue = async()=>{
    //add a transaction
    db.collection("transactions").add({
      'studentid': this.state.scannedStudentId,
      'bookid' : this.state.scannedBookId,
      'date' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType': "Issue"
    })
    //change book status
    db.collection("books").doc(this.state.scannedBookId).update({
      'bookAvail': false
    })
    //change number  of issued books for student
    db.collection("students").doc(this.state.scannedStudentId).update({
      'noOfBooks': firebase.firestore.FieldValue.increment(1)
    })
  }

  initiateBookReturn = async()=>{
    //add a transaction
    db.collection("transactions").add({
      'studentid': this.state.scannedStudentId,
      'bookid' : this.state.scannedBookId,
      'date' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType': "Return"
    })
    //change book status
    db.collection("books").doc(this.state.scannedBookId).update({
      'bookAvail': true
    })
    //change number  of issued books for student
    db.collection("students").doc(this.state.scannedStudentId).update({
      'noOfBooks': firebase.firestore.FieldValue.increment(-1)
    })
  }


  handleTransaction = async()=>{
   //verify if the student is eligible for book issue or return or none
    //student id exists in the database
    //issue : number of book issued < 2
    //issue: verify book availability
    //return: last transaction -> book issued by the student id
    var transactionType = await this.checkBookEligibility();//false/Issue/Return
    console.log("TransactionType",transactionType)
    if (!transactionType) {
      Alert.alert("The book doesn't exist in the library database!");//if false
      this.setState({
        scannedStudentId: "", //Epmty the given strings in input box
        scannedBookId: ""
      });
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();//True/false/Issue
      if (isStudentEligible) {
        this.initiateBookIssue();
        Alert.alert("Book issued to the student!");
      }
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForReturn();//True/false
      if (isStudentEligible) {//if the var holds true it ll proceed, if false then go to the function
        this.initiateBookReturn();
        Alert.alert("Book returned to the library!");
      }
    }
  };

  checkBookEligibility = async () => {
    const bookRef = await db
      .collection("books")
      .where("bookid", "==", this.state.scannedBookId)//no match
      .get();
    var transactionType = "";//If nothing store in this empty array then false
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map(doc => {//the doc here is like  portar carrying the data fields
        var book = doc.data();
        if (book.bookAvail) {//Check wheather the book is available or not
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }

    return transactionType;
  };

  checkStudentEligibilityForBookIssue = async () => {//check for same student id or different & noOfBooks<2
    const studentRef = await db
      .collection("students")
      .where("studentid", "==", this.state.scannedStudentId)//Comparing student id
      .get();
    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      this.setState({
        scannedStudentId: "",
        scannedBookId: ""
      });
      isStudentEligible = false;
      Alert.alert("The student id doesn't exist in the database!");
    } else {//I you provide correct id available in db
      studentRef.docs.map(doc => {
        var student = doc.data();
        if (student.noOfBooks < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          Alert.alert("The student has already issued 2 books!");
          this.setState({
            scannedStudentId: "",
            scannedBookId: ""
          });
        }
      });
    }//O/p of the function is either false/true/false (This ll be call back in line 103)
    return isStudentEligible;
  };

  checkStudentEligibilityForReturn = async () => {//This is about transaction, Which ll look for both bookid & studentid
    const transactionRef = await db
      .collection("transactions")
      .where("bookid", "==", this.state.scannedBookId)
      .limit(1)
      .get();
    var isStudentEligible = "";
    transactionRef.docs.map(doc => {
      var lastBookTransaction = doc.data();
      if (lastBookTransaction.studentid === this.state.scannedStudentId) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        Alert.alert("The book wasn't issued by this student!");
        this.setState({
          scannedStudentId: "",
          scannedBookId: ""
        });
      }
    });
    return isStudentEligible;
  };

    render() {

      console.log(this.state)
      if(this.state.hasCamPermission === true && this.state.buttonState !== "normal"){
        return(
            <BarCodeScanner
              onBarCodeScanned={this.state.scanned ? "undefined" : this.handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}/>
        )}
        else if (this.state.buttonState === "normal"){
        
        return (
          <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
          <View style={styles.container}>
           <View>
              <Image
              source={require("../assets/booklogo.jpg")}
              style={{width:200,height:200}}/>
            </View> 
          <View style={styles.inputView}>
            <TextInput placeholder ="bookid" 
            onChangeText ={ text => this.setState({scannedBookId:text})}
            value={this.state.scannedBookId}/>
            <TouchableOpacity style = {styles.scanButton}
            onPress={()=>{
              this.getCameraPermissions("bookid")
            }}>
            <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          
          
          <View style={styles.inputView}>
            <TextInput placeholder ="studentid" 
            onChangeText ={ text => this.setState({scannedStudentId:text})}
            value={this.state.scannedStudentId}/>
            <TouchableOpacity style = {styles.scanButton}
            onPress={()=>{
              this.getCameraPermissions("studentid")
            }}>
            <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
          style= {styles.submitButton}>
          <Text style = {styles.submitButtonText}
          onPress={async()=>{this.handleTransaction();
              }}
        >Submit</Text>
          </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton:{
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText:{
    fontSize: 20,
  },
  inputView:{
    flexDirection: 'row',
    margin: 20
  },
  inputBox:{
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
  },
  scanButton:{
    backgroundColor: 'green',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0
  }
});
