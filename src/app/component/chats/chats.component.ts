import { UserService } from './../../services/user.service';
import { ChatService } from './../../services/chat.service';
import { StoresService } from './../../services/stores.service';
import { ActivatedRoute } from '@angular/router';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css'],
})
export class ChatsComponent implements OnInit {
  storeId: any;
  storeData: any;
  @Input() userData: any;
  chatData: any;
  message: any;
  openChat = false;
  theChatOpenedId: any;

  constructor(
    _activatedRoute: ActivatedRoute,
    private StoresService: StoresService,
    private ChatService: ChatService,
    private UserService: UserService,
    private SharedService: SharedService
  ) {
    this.storeId = _activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
this.SharedService.currentUserData.subscribe((data:any)=>{
  this.userData = data
  this.SharedService.currentStoreData.subscribe((data: any) => {
    this.storeData = data;
this.getChat()
  });
})
    // this.SharedService.listen('resevMessage').subscribe((data: any) => {
    //   this.SharedService.updateStoreData(this.storeId)
    //   this.SharedService.updateUserData()
    // });


  }
  getChat() {
    if (this.userData?.storeId && this.userData?.storeId?._id == this.storeId && this.theChatOpenedId) {

      for (let i = 0; i < this.storeData?.chats?.length; i++) {
        const element = this.storeData.chats[i];
        if (element.userId._id == this.theChatOpenedId) {
          let chat = {
            chat: element,
            chatDetails: element.userId,
            myData: element.storeId,
          };
          this.chatData = chat;
        }
      }
    } else {
      for (let i = 0; i < this.userData?.chats?.length; i++) {
        const element = this.userData.chats[i];
        if (element.storeId?._id == this.storeId) {
          let chat = {
            chat: element,
            chatDetails: element.storeId,
            myData: element.userId,
          };
          this.chatData = chat;
        }
      }
    }
  }
  send() {
    if (this.userData?.storeId?._id != this.storeId) {
      this.StoresService.getStore(this.storeId).subscribe((StoreData: any) => {
        let Data = {
          storeId: this.storeId,
          userId: this.userData?._id,
          content: this.message,
          senderModel: 'User',
          receiverModel: 'Store',
          sender: this.userData._id,
          receiver: this.storeId,
          socketID: StoreData.store.socketID,
        };
        this.ChatService.sendMessage(Data).subscribe((data: any) => {
          if (data.message == 'Done') {
            this.message=''

            this.SharedService.updateUserData();
            this.SharedService.emit('sendMessage', Data);
            this.getChat();
          }
        });
      });
    }
    else{

      this.UserService.getUserById(this.theChatOpenedId).subscribe((userData:any)=>{
        let Data = {
          storeId: this.storeId,
          userId: this.theChatOpenedId,
          content: this.message,
          receiverModel: 'User',
          senderModel: 'Store',
          receiver: this.userData._id,
          sender: this.storeId,
          socketID: userData.user.socketID,
        };

        this.ChatService.sendMessage(Data).subscribe((data: any) => {

          if (data.message == 'Done') {
            this.message=''

            this.SharedService.updateStoreData(this.storeId);
            this.SharedService.emit('sendMessage', Data);
            this.getChat();
          }
        });
      })
    }
  }
}
