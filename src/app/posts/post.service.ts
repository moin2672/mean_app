import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {environment} from '../../environments/environment';
const BACKEND_URL="/posts";

@Injectable({
  providedIn: 'root'
})
export class PostService {
  
  url: string = environment.apiUrl+BACKEND_URL;
  private posts: Post[] = [];
  
  private postUpdated = new Subject<{posts:Post[], postCount:number}>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string, posts: any, maxPosts: number }>(this.url + queryParams)
      .pipe(map((postData) => {
        //console.log("postData");
        //console.log(postData);
        return {
          posts: postData.posts.map(post => {
            // console.log("gettingAllPost");
            // console.log(post);
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe(transformedPostsData => {
        //console.log(transformedPostsData);
        this.posts = transformedPostsData.posts;
        this.postUpdated.next({
          posts:[...this.posts], 
          postCount: transformedPostsData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postUpdated.asObservable();
  }

  /*addPost(title:string, content:string, image: FileList){

    // const post:Post={id:null, title:title, content: content};
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    
  
    for(var i=0;i<image.length;i++){
      postData.append("image[]", image[i], title);
    }
  

    this.http.post<{message: string,postId:string}>(this.url, postData)
    .subscribe((responseData)=>{
      const post: Post={id:responseData.postId, title:title, content: content}
      // const id= responseData.postId;
      // post.id=id;
      console.log(responseData);
      console.log(responseData.message);
      this.posts.push(post);
      this.postUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
    // this.posts.push(post);
    // this.postUpdated.next([...this.posts]);
  }
*/
  addPost(title: string, content: string, image: File) {

    // const post:Post={id:null, title:title, content: content};
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http.post<{ message: string, post: Post }>(this.url, postData)
      .subscribe((responseData) => {
    //     // console.log('responseData');
    //     // console.log(responseData);
    //     const post: Post = {
    //       id: responseData.post.id,
    //       title: title,
    //       content: content,
    //       imagePath: responseData.post.imagePath
    //     }
    //     // const id= responseData.postId;
    //     // post.id=id;
    //     // console.log(responseData);
    //     // console.log(responseData.message);
    //     this.posts.push(post);
    //     this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
    // this.posts.push(post);
    // this.postUpdated.next([...this.posts]);
  }


  updatePost(id: string, title: string, content: string, image: File | string) {
    // const post: Post={id:id, title: title, content: content, imagePath:null};


    let postData: Post | FormData;
    if (typeof (image) === 'string') {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator:null
      }

    } else {

      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);

    }

    this.http.put(this.url + '/' + id, postData)
      .subscribe(
        response => {

          // const updatedPosts = [...this.posts];
          // const oldPostIndex = updatedPosts.findIndex(p => p.id === id);


          // const post: Post = {
          //   id: id,
          //   title: title,
          //   content: content,
          //   imagePath: ""
          // }
          // updatedPosts[oldPostIndex] = post;
          // this.posts = updatedPosts;
          // // console.log("subscribed");
          // // console.log(updatedPosts);
          // this.postUpdated.next([...this.posts]);
          this.router.navigate(["/"]);
        }
      );
  }

  getPost(id: string) {
    // return {...this.posts.find(post=>post.id===id)};
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(this.url + '/' + id);
  }

  DeletePost(postId: string) {
    return this.http.delete(this.url + '/' + postId);
        // this.http.delete(this.url + '/' + postId)
        // .subscribe(() => {
        // const updatedPosts = this.posts.filter(post => post.id !== postId);
        // this.posts = updatedPosts;
        // this.postUpdated.next([...this.posts])
        // console.log('Deleted..!')
      // })
  }




}
