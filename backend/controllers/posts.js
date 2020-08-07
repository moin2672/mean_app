const Post = require('../models/post');

exports.createPost = (req,res, next)=>{
    const url=req.protocol+"://"+req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath:url+"/images/"+req.file.filename,
        creator: req.userData.userId
    });
    post.save()
        .then(createdPostresult=>{
            res.status(201).json(
                {
                    message:'Post added successfully!!',
                    // postId: createdPostresult._id

                    post:{
                        id: createdPostresult._id,
                        title: createdPostresult.title,
                        content: createdPostresult.content,
                        imagePath: createdPostresult.imagePath
                    }
                    // ...createdPostresult,
                    // id: createdPostresult._id
                }
            );
            //console.log(result)
        })
        .catch(error=>{
            res.status(500).json({
                message:"Creating a post failed!"
            })
        });
    
}

exports.updatePost = (req,res, next) =>{
    // console.log("req.body");
    // console.log(req.body);
    // console.log("req.file");
    // console.log(req.file);
    let imagePath=req.body.imagePath;
    if(req.file){
        const url=req.protocol+"://"+req.get("host");
        imagePath=url+"/images/"+req.file.filename
    }
    const post= new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath:imagePath,
        creator: req.userData.userId
    });
    //console.log(post);
    Post.updateOne({_id:req.params.id, creator: req.userData.userId}, post)
        .then(result=>{
            //console.log(result);
            if(result.n>0){
                res.status(200).json({
                    message: 'Post updated successfully!',
                });
            }else{
                res.status(401).json({
                    message: 'Not Authorised to update the post',
                });
            }
        })
        .catch(
            //()=> console.log(req.params.id+' Post not updated')
            error =>{
                res.status(500).json({
                    message: "Couldn't update the post!"
                });
            })
}

exports.getPosts = (req,res, next)=>{
    
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage){
        postQuery
            .skip(pageSize * (currentPage-1))
            .limit(pageSize);
    }

    postQuery
        .then(documents => {
            fetchedPosts=documents;
            return Post.countDocuments();
        })
        .then(count => {
            res.status(200).json({
                message: 'Posts fetched successfully!',
                posts: fetchedPosts,
                maxPosts: count
            });
        })
        .catch(error =>{
            res.status(500).json({
                message:"Failed to fetch posts!"
            });
         });
    
}

exports.getPost = (req,res, next)=>{
    Post.findById(req.params.id)
        .then(post=>{
            if(post){
                res.status(200).json(post);
            } else {
                res.status(404).json({
                    message: 'Post Not Found!'
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message:"Failed to fetch the post!"
            });
        });
}

exports.deletePost =(req,res, next)=>{
    //console.log(req.params.id);
    Post.deleteOne({_id:req.params.id, creator: req.userData.userId})
        .then(result => {
            //console.log(result);
            if(result.n>0){
                res.status(200).json({message:'Post Deleted!'});
            } else {
                res.status(401).json({message:'Not authorized to Delete a Post!'});
            }
        })
        .catch(error => {
            res.status(500).json({message:"Couldn't delete Post!"});
        });
    
}