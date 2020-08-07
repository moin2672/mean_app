import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
// import {mimeType} from './mime-type.validator';



@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  post: Post;
  enteredTitle = ""
  enteredContent = "";
  editMode = false;
  imagesPre: Array<String> = [];
  imagePreview: string;
  isLoading = false;
  form: FormGroup;
  private postId: string;
  private authStatusSub: Subscription;

  constructor(private postService: PostService,
    private route: ActivatedRoute,
    private authService: AuthService) {

  }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus =>{
        this.isLoading=false;
      }
    );
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required]/*,asyncValidators:[mimeType] */}),
    })
    this.route.paramMap.subscribe(
      (paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
          // this.mode='edit';
          this.editMode = true;
          this.postId = paramMap.get('postId');
          //to add spinner
          this.isLoading = true;
          this.postService.getPost(this.postId).subscribe(
            (postData) => {
              //
              this.isLoading = false;
              this.post = { 
                id: postData._id, 
                title: postData.title, 
                content: postData.content,
                imagePath:postData.imagePath,
                creator:postData.creator
              };
              this.form.setValue({ 
                title: this.post.title, 
                content: this.post.content,
                image: this.post.imagePath })
            }
          );
        } else {
          // this.mode='create';
          this.editMode = false;
        }
      }

    );
  }

 /* onImagePicked(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    this.form.patchValue({ image: files });
    this.form.get('image').updateValueAndValidity();
  
    for(var i=0;i<files.length;i++){

    var reader = new FileReader();
    var file=files[i];
    reader.onload = (e) => {
      
      this.imagePreview = e.target.result as string;
      //console.log(reader.result);
      this.imagesPre.push(this.imagePreview);
    }
    // console.log(this.imagesPre);
    // console.log(this.imagePreview);
    


    reader.readAsDataURL(files[i]);

  }

  }*/

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    
    // console.log(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      // console.log(this.imagePreview);
    }
    reader.readAsDataURL(file);

  }

  


  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.editMode) {
      // console.log('Updating the existing post');
      this.postService.updatePost(
        this.postId, 
        this.form.value.title, 
        this.form.value.content,
        this.form.value.image
        );
        
        // console.log(this.postId, 
        // this.form.value.title, 
        // this.form.value.content,
        // this.form.value.image);
    } else {
      // console.log('adding a new post');
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    }

    this.form.reset();
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }


}
