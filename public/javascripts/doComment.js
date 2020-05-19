<script>
  function doComment(form) {
    $.ajax({
      url: "/posts/"+ post.id,
      method: "POST",
      data:{
        name: form.name.value,
        body: form.body.value,
        email: form.email.value,
        postid: form.postid.value
      },
      success: function(response){
        alert(response);
      }
    });
    return false;
  }
</script>