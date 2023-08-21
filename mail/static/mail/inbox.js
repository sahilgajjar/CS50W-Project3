document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click',function() {
    removeActive();
    load_mailbox('inbox');
    document.querySelector('#inbox').classList.add('active');
  })

  document.querySelector('#sent').addEventListener('click',function() {
    removeActive();
    load_mailbox('sent');
    document.querySelector('#sent').classList.add('active');
  })

  document.querySelector('#archived').addEventListener('click',function() {
    removeActive();
    load_mailbox('archive');
    document.querySelector('#archived').classList.add('active');
  })

  document.querySelector('#compose').addEventListener('click',function() {
    removeActive();
    compose_email('');
    document.querySelector('#compose').classList.add('active');
  })


  // add evenet handler to the form 
  document.querySelector('#compose-form').addEventListener('submit', submit_mail);

  // By default, load the inbox
  removeActive();
  document.querySelector('#inbox').classList.add('active');
  load_mailbox('inbox');

  // adding color click event
  const color1 = document.getElementById('color1');
  const color2 = document.getElementById('color2');
  const color3 = document.getElementById('color3');
  const color4 = document.getElementById('color4');
  const color5 = document.getElementById('color5');

  color1.onclick = () => {
    document.documentElement.style.setProperty('--border-color', '#44aafb');
  }

  color2.onclick = () => {
    document.documentElement.style.setProperty('--border-color', '#7446fa');
  }

  color3.onclick = () => {
    document.documentElement.style.setProperty('--border-color', '#0CA678');
  }

  color4.onclick = () => {
    document.documentElement.style.setProperty('--border-color', '#E03131');
  }

  color5.onclick = () => {
    document.documentElement.style.setProperty('--border-color', 'black');
  }

  
});

// remove active element from all the buttons 
function removeActive(){
  const element = document.querySelector("btn-div");
  const items = document.querySelectorAll(".btn");

  items.forEach(item => {
    item.classList.remove("active");
  });
}

function submit_mail(event) {
  event.preventDefault();

  const recipients_mail = document.querySelector("#compose-recipients").value;
  const mail_subject = document.querySelector("#compose-subject").value;
  const mail_body = document.querySelector("#compose-body").value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients_mail,
      subject: mail_subject,
      body: mail_body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    removeActive();
    load_mailbox('sent');
    document.querySelector('#sent').classList.add('active');
  });

}

function compose_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#outer-view-mail').style.display = 'none';
  document.querySelector('#view-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  console.log(email);
  if (email == ''){
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    document.querySelector('#compose-recipients').value = `${email.sender}`;

    if((email.subject).startsWith('Re: ')){
      document.querySelector('#compose-subject').value = `${email.subject}`;
    } else{
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }

    document.querySelector('#compose-body').value = `\n\n\nOn ${email.timestamp} ${email.sender} wrote :\n${email.body}`;

  }

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-list-section').style.display = 'block';

  document.querySelector('#outer-view-mail').style.display = 'none';
  document.querySelector('#view-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view .title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  document.querySelector('#email-list-section').innerHTML = '';

  const emailView = document.querySelector('#email-list-section');

  // fetch the mails from the api
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(email => {

      const mailDiv = createMailDiv(email, mailbox);

      mailDiv.addEventListener('click', () => view_mail(email.id, mailbox));

      emailView.appendChild(mailDiv);

      if(mailbox != 'sent'){

      const archiveButton = mailDiv.querySelector('.archive-button');
      archiveButton.addEventListener('click', function(event) {

        let doArchive = email.archived ? false : true;
        console.log(email.read);
        console.log("in the archive section");
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: doArchive
          })
        })
        .then(() => { load_mailbox(mailbox) })
        event.stopPropagation()
      })

      }
      // if a mail has been viewed or not
      console.log(email.read);
      mailDiv.style.backgroundColor = email.read ? '#eeeeee' : 'white';

      });
    })

    .catch(error => {
      console.error('Error fetching emails:', error);
    });
}

function createMailDiv(email, mailbox){

  const divElement = document.createElement('div');
  divElement.className = 'mail-div';

  let svgIcon;
  let sent;

  if(email.read){
    svgIcon = '<svg class="icons" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M64 208.1L256 65.9 448 208.1v47.4L289.5 373c-9.7 7.2-21.4 11-33.5 11s-23.8-3.9-33.5-11L64 255.5V208.1zM256 0c-12.1 0-23.8 3.9-33.5 11L25.9 156.7C9.6 168.8 0 187.8 0 208.1V448c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V208.1c0-20.3-9.6-39.4-25.9-51.4L289.5 11C279.8 3.9 268.1 0 256 0z"/></svg>';
  } else {
    svgIcon = '<svg class="icons" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>';
  }

  sent = mailbox == 'sent' ? '' : '<button type="button" class="archive-button">Archive</button>'

  if(mailbox == 'sent'){
    sent = ''
  } else{
    if(email.archived){
      sent = '<button type="button" class="archive-button">Unarchive</button>';
    } else{
      sent = '<button type="button" class="archive-button">Archive</button>';
    }
  }

  divElement.innerHTML = 
  `
  <div class="mail-a-div">
    <div class="mail-a-div">
      ${svgIcon}
      <h6>
        &nbsp;&nbsp;${email.subject}
      </h6>
    </div>
    ${sent}
  </div>
  <hr>
  <div class="mail-1-div">
    <div class="mail-2-div">
      <svg class="icons" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
      <h6 style="display:block">&nbsp;&nbsp;${email.sender}</h6>
    </div>
    <h6>&nbsp;&nbsp;</h6>
    <h6>${email.timestamp}</h6>
  </div>
  `;

  return divElement;
}

function view_mail(email_id, mailbox) {

  console.log("in the mail");
  // show the view-mail and hide other view
  document.querySelector('#outer-view-mail').style.display = 'block';
  document.querySelector('#view-mail').style.display = 'block';
  document.querySelector('#view-mail').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  const element = document.querySelector('#view-mail');
  element.innerHTML = '';
  const buttonDiv = document.querySelector('#buttons');


  // fetch the mail content using get request
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    console.log(email.body)
    element.innerHTML = 
    `
    <h6> From: ${email.sender} </h6>
    <h6>To: ${email.recipients}</h6>
    <br>
    <div class="mail-1-div border-bottom" >
      <h5 style="font-family: 'Roboto', sans-serif; font-size: 25px;"><b>${email.subject}</b><h5>
      <h6> <b> ${email.timestamp} </b></h6>
    </div>
    <h6 class="body-area" style="font-weight:400 ;white-space: pre"; >${email.body}<h6>
    `;
    
    const archiveElement = document.createElement('button');
    const replyElement = document.createElement('button');

    archiveElement.className = 'archive-button';
    archiveElement.type = 'button';

    replyElement.className = 'reply-button';
    replyElement.type = 'button';

    buttonDiv.innerHTML = ''

    if(mailbox != 'sent'){
      
      // appending archive button
      archiveElement.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      buttonDiv.appendChild(archiveElement);
      
      // archive and unarchive toggle button
      archiveElement.addEventListener('click', function() {

        let doArchive = email.archived ? false : true;

        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: doArchive
          })
        })
        .then(() => { 
          removeActive();
          load_mailbox(mailbox);
          document.querySelector(`#${mailbox}`).classList.add('active');
        })

      })
      
      // appending reply button
      replyElement.innerHTML= 'Reply';
      buttonDiv.appendChild(replyElement);

      const bodyText = email.body;
      const subjectText = email.subject;

      replyElement.addEventListener('click', function() {
        removeActive();
        compose_email(email);
        document.querySelector('#compose').classList.add('active');
      })

    }
    else {
      // think about it 🙄!
    }


    if(email.read == false) {
      // we will update the read to true
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }

    });

}

