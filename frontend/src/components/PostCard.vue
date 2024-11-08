<template>
    <v-card>
      <v-card-actions>
        <v-row>
          <v-col cols="11">
            <v-list-item class="w-100">
              <v-list-item-title>@kule123</v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="1">
            <v-btn icon="mdi-dots-vertical"></v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
  
      <v-row>
        <v-col cols="12">
          <v-img src="https://media.istockphoto.com/id/173893247/photo/rabbit.jpg?s=2048x2048&w=is&k=20&c=TyN2c_awaFuVoycFZNjpC3F74i2Ry0VrH7A5myNGfS4="></v-img>
        </v-col>
      </v-row>
  
      <v-card-text>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur ea error a placeat, officiis quas fuga sit hic ullam minima.</p>
      </v-card-text>
  
      <v-card-actions>
        <v-row align="center">
          <v-col cols="2">
            <v-btn icon @click="toggleLike">
              <v-icon v-if="liked" color="red" class="responsive-icon" size="48">mdi-rabbit-variant</v-icon>
              <v-icon v-else class="responsive-icon" size="48">mdi-rabbit-variant-outline</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <span>{{ likeCount }}</span>  
          </v-col>
          <v-col>
            <v-btn text @click="toggleComments" class="ml-2">
              {{ showComments ? 'Hide Comments' : 'View Comments' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
  
      <transition name="expand">
        <v-card v-if="showComments" class="mt-3" elevation="2">
          <v-card-text>
            <v-row align="center">
              <v-col cols="9">
                <v-textarea
                  v-model="newComment"
                  rows="1"
                  outlined
                  class="comment-bubble"
                  placeholder="Add a comment"
                ></v-textarea>
              </v-col>
              <v-col cols="3">
                <v-btn @click="addComment" color="primary">Send</v-btn>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <div class="comments-container">
              <div v-for="(comment, index) in comments" :key="index" class="comment">
                <p><strong>@{{ comment.username }}</strong></p>
                <p>{{ comment.text }}</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </transition>
    </v-card>
  </template>
  
  <script>
  export default {
    data() {
      return {
        likeCount: 0,
        liked: false,
        showComments: false,
        newComment: '',
        comments: [
          { username: 'user1', text: 'This is a great post!' },
          { username: 'user2', text: 'Thanks for sharing!' },
          { username: 'user3', text: 'Amazing rabbit!' },
        ],
      };
    },
    methods: {
      toggleLike() {
        this.liked = !this.liked;
        this.liked ? this.likeCount++ : this.likeCount--;
      },
      toggleComments() {
        this.showComments = !this.showComments;
      },
      addComment() {
        if (this.newComment.trim()) {
          this.comments.push({ username: 'You', text: this.newComment.trim() });
          this.newComment = '';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .expand-enter-active, .expand-leave-active {
    transition: max-height 0.5s ease;
  }
  .expand-enter, .expand-leave-to  {
    max-height: 0;
    overflow: hidden;
  }
  .comments-container {
    max-height: 200px;
    overflow-y: auto;
  }
  .comment {
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
  }
  .comment-bubble .v-textarea__control {
    border-radius: 50px; 
    border: 1px solid #ccc;
    padding: 8px;
    box-shadow: none;
    background-color: #f9f9f9;
  }
  .comment-bubble .v-textarea__textarea {
    padding: 0 !important;
    margin-top: -2px;
  }
  </style>