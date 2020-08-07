import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {Post} from '../post.model';
import {PostService} from '../post.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[]=[];
  userId:string;
  private postsSub:Subscription;
  private authStatusSub:Subscription;

  isUserAuthenticated = false;
  totalPosts=0;
  postsPerPage = 2;
  currentPage=1;
  pageSizeOptions=[1,2,5,10];
  isLoading=false;
  

  onChangedPage(pageData: PageEvent){
    
    this.isLoading=true;
    this.currentPage= pageData.pageIndex+1;
    this.postsPerPage=pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    //console.log(pageData);
  }
  // posts=[
  //   {title:'First Post', content:'This is the First post\'s content'},
  //   {title:'Second Post', content:'This is the Second post\'s content'},
  //   {title:'Third Post', content:'This is the Third post\'s content'}
  // ];

  constructor(private postService: PostService,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading=true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId=this.authService.getuserId();
    this.postsSub= this.postService.getPostUpdateListener().subscribe(
      (postData:{posts:Post[], postCount:number})=>{
        this.isLoading=false;
        this.posts=postData.posts;
        this.totalPosts=postData.postCount;
      });
    this.isUserAuthenticated=this.authService.getIsAuth();
    //console.log('b4 list auth=');
    //console.log(this.isUserAuthenticated);
    this.authStatusSub=this.authService
                            .getAuthStatusListener()
                            .subscribe(isAuthenticated=>{
                            this.isUserAuthenticated= isAuthenticated
                            this.userId=this.authService.getuserId();
                          });
    //console.log('after list auth=');
    //console.log(this.isUserAuthenticated);
    // console.log("this.postsPerPage");
    // console.log(this.postsPerPage);
    // console.log("this.currentPage");
    // console.log(this.currentPage);
    // console.log("this.totalPosts");
    // console.log(this.totalPosts);
  }

  onDelete(postId: string){
    this.isLoading=true;
    this.postService.DeletePost(postId).subscribe(()=>{
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, ()=>{
      this.isLoading=false;
    });
  }
  ngOnDestroy(){
   this.postsSub.unsubscribe();
   this.authStatusSub.unsubscribe();
  }
}
