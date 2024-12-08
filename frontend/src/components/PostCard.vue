<template>
  <v-card>
    <v-card-actions>
      <v-row>
        <v-col cols="11">
          <v-list-item class="w-100">
            <v-list-item-title>@{{ post.username }}</v-list-item-title>
          </v-list-item>
        </v-col>
        <v-col cols="1">
          <v-menu v-if="store.username == post.username && !simplified" location="start">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
            </template>

            <v-list>
              <v-list-item @click="openEditDialog(post)">
                <v-list-item-title>
                  <v-icon left>mdi-pencil</v-icon>
                  Update Description
                </v-list-item-title>
              </v-list-item>

              <v-list-item @click="deletePost(post)">
                <v-list-item-title>
                  <v-icon left>mdi-trash-can</v-icon>
                  Delete
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-card-actions>

    <v-row>
      <v-col cols="12">
        <v-img :src="`http://localhost:3000/api/image/get/${post.imagePath}`" aspect-ratio="16/9" max-height="300"
          contain />
      </v-col>
    </v-row>

    <v-card-text>
      <p>{{ post.caption }}</p>
    </v-card-text>

    <v-card-actions>
      <v-row align="center">
        <v-col cols="2">
          <v-btn icon :disabled="store.role === 'guest'" @click="toggleLike(post)">
            <v-icon v-if="post.isLiked" color="red" class="responsive-icon" size="48">mdi-rabbit-variant</v-icon>
            <v-icon v-else class="responsive-icon" size="48">mdi-rabbit-variant-outline</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <span>{{ post.likesCount }}</span>
        </v-col>
        <v-col>
          <v-btn v-if="store.role !== 'guest' && !simplified" text @click="toggleComments" class="ml-2">
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
              <v-textarea v-model="newComment" rows="1" outlined class="comment-bubble"
                placeholder="Add a comment"></v-textarea>
            </v-col>
            <v-col cols="3">
              <v-btn @click="addComment(post)" color="primary">Send</v-btn>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <div class="comments-container">
            <div v-for="comment in post.comments" class="comment">
              <p><strong>@{{ comment.username }}</strong></p>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </transition>
  </v-card>


  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card style="display: flex; flex-direction: column; align-items: cent;">
      <v-card-title class="headline">Are you sure?</v-card-title>
      <v-card-text>
        <div class="text-center">
          <v-img :src="delete_image"></v-img>
          Are you sure you want to delete this post? This action cannot be undone.
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="cancelDelete">Cancel</v-btn>
        <v-btn color="red" text @click="confirmDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editDialog" max-width="500">
    <v-card>
      <v-card-title class="headline">Edit Post Description</v-card-title>
      <v-card-text>
        <v-text-field v-model="newCaption" prepend-icon="mdi-pencil-outline" label="Describe the moment 🐰💬"
          :rules="captionRules" maxlength="141" counter required outlined dense class="input-field"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="closeEditDialog">Cancel</v-btn>
        <v-btn color="primary" @click="updatePost">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


</template>

<script>
import axiosInstance from '@/utils/axiosInstance';
import rabbit_delete from '@/assets/rabbit-delete.png';
import { store } from '@/utils/store';

export default {
  props: {
    post: {
      type: Object,
      required: true
    },
    simplified: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showComments: false,
      newComment: '',
      showDeleteDialog: false,
      editDialog: false,
      newCaption: '',
      delete_image: rabbit_delete,
      captionRules: [v => !!v || 'Caption is required'],
    };
  },
  computed: {
    store() {
      return store;
    }
  },
  emits: ['postDeleted'],
  methods: {

    openEditDialog() {
      this.editDialog = true;
      this.newCaption = this.post.caption;
    },

    closeEditDialog() {
      this.editDialog = false;
    },

    cancelDelete() {
      this.showDeleteDialog = false;
    },
    confirmDelete() {
      axiosInstance.delete(`/post/delete`, { data: { postId: this.post.id } })
        .then(() => {
          this.showDeleteDialog = false;
          this.$emit('postDeleted', this.post.id);
        })
        .catch(error => {
          console.error('Error deleting post:', error);
        });
    },

    updatePost() {
      console.log(`Updating post with id: ${this.post.id}`);
      if (this.newCaption.trim()) {
        axiosInstance.put('/post/update', { postId: this.post.id, caption: this.newCaption })
          .then(() => {
            this.editDialog = false;
            this.post.caption = this.newCaption;
          })
          .catch(error => {
            console.error('Error updating post:', error);
          });
      }
    },
    deletePost(post) {
      this.showDeleteDialog = true;
    },
    toggleLike(post) {
      post.isLiked = !post.isLiked;
      axiosInstance.put('/post/like', post).then(response => {
        post.likesCount = response.data.likesCount;
      });
    },
    toggleComments() {
      this.showComments = !this.showComments;
    },
    addComment(post) {
      if (this.newComment.trim()) {
        const newCommentObj = {
          postId: post.id,
          content: this.newComment.trim()
        };

        axiosInstance.post('/post/comment/add', newCommentObj)
          .then(response => {
            post.comments = response.data.comments;
          })
          .catch(error => {
            console.error('Error adding comment:', error);
          });
        this.newComment = '';
      }
    }
  }
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.5s ease;
}

.expand-enter,
.expand-leave-to {
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

.custom-img {
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
}
</style>