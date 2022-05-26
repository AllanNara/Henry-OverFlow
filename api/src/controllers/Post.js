
const { Post, Tag, User, Comment} = require('../db');

const getPost = (req, res, next) => {
    const id = req.params.id;
    const title = req.query.title;

         Post.findAll({
            include: [
                {
                model: Tag,
                attributes: ["name", "id"],
                through: {
                    attributes: []
                }
                },
                {
                model: Comment,
                attributes: ["message"],
                },
                {                    
                model: User,
                attributes: ["first_name", "last_name", "id"],               
                
                }       
            ]
        }).then(post => {
            if(id){
                let postId = post.filter(el => el.id == id);
                postId.length ? res.status(200).send(postId) : res.status(400).send("question not found")
            } 
            if(title){
                let postTitle = post.filter(el => el.title.toLowerCase().includes(title.toLowerCase()))
                postTitle.length ? res.send(postTitle) : res.status(400).send("question not found")
            }
           return  res.send(post)})
        .catch(error => next(error))
    
}

const addPost = async (req, res, next) => {
    try {
        const { idUser } = req.params;
        const createdBy = await User.findByPk(idUser);

        const {title, message, rating, tag} = req.body;
        const postCreated = await Post.create({
        title, message, rating
        })
        const tags = await Tag.findAll({
            where: {
                name : tag
            }
        })
        postCreated.addTag(tags);
        createdBy.addPost(postCreated)
        res.send("Post done successfully")
    } catch (error) {
        next(error)
    }
}

const updatePost = async (req, res, next) => {
    const id = req.params.id;
    const {title, message, rating, tag} = req.body;
    const postUpdated = Post.update(
        {title, message, rating},{
            where: {id},  raw : true 
        },
    )
    const tags = await Tag.findAll({
        where: {
            name : tag
        }
    })
    postUpdated.addTag(tags);
    res.send(postUpdated)
}

const deletePost = (req, res, next) => {
    const id = req. params.id;
    return Post.destroy({
        where: {
            id
        }
    }).then(() => {res.status(200).send("post deleted successfully")})
    .catch(error => next(error))
}

module.exports = {
    getPost, 
    addPost,
    updatePost,
    deletePost
}