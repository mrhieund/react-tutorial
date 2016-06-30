var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                <Comment author = {comment.author} key={comment.id}>
                    {comment.text}
                </Comment>
            );
        });

        return (
            <div className = "commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    getInitialState: function() {
        return {author: '', text: ''};
    },
    handleAuthorChange: function(e) {
        this.setState({author: e.target.value});
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.setState({author: '', text:''});
    },
    render: function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange} />
                <input type="text" placeholder="Say something..."  value={this.state.text} onChange={this.handleTextChange} />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var CommentBox = React.createClass({
    loadCommentsFromServer: function() {
        var headers = new Headers({
            "Content-Type": "application/json"
        });
        var thisComponent = this;
        fetch(this.props.url, {headers: headers})
            .then(function(response){ return response.json() })
            .then(function(json){ thisComponent.setState({data : json}) })
            .catch(function(e) {console.error(e)} )
    },
    handleCommentSubmit: function(comment) {
        var comments = this.state.data;
        var headers = new Headers({
            'Accept': 'application/json',
            "Content-Type": "application/json"
        });
        comment.id = Date.now();
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        var thisComponent = this;
        var data = '?author=' + comment.author + '&text=' + comment.text;
        fetch(this.props.url + data, {method: 'POST', headers: headers})
            .then(function(response){ return response.json() })
            .then(function(json){ thisComponent.setState({data : json}) })
            .catch(function(e) {thisComponent.setState({data: comments}); console.error(e);} )
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
      return (
        <div className="commentBox">
            <h1>Comments</h1>
            <CommentList data={this.state.data} />
            <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        </div>
      );
    }
});

var Comment = React.createClass({
    render: function() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                {this.props.children}
            </div>
        );
    }
});

ReactDOM.render(
    <CommentBox url="/api/comments" pollInterval={10000} />,
    document.getElementById('content')
);