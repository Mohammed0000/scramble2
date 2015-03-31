// Flux-style store

// TODO: store to a DB
function AppStore() {
  this.imapAccounts = []
  this.keybaseAccount = null 

  // UI state
  this.pagesEnum = {
    login: "login",
    inbox: "inbox",
    outbox: "outbox",
    contacts: "contacts
  }
  this.view = {
    page: this.pagesEnum.LOGIN
  }
}

function LoginStore() {
}

function InboxStore() {
  this.searchQuery = ""
  this.selectedThreadID = null 
  this.messages = []
}

function ContactsStore() {
}

