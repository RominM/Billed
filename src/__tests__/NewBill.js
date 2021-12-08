/**
 * @jest-environment jsdom
 */
 import { fireEvent,screen } from "@testing-library/dom"
 import NewBillUI from "../views/NewBillUI.js"
 import BillsUI from "../views/BillsUI.js"
 import NewBill from "../containers/NewBill.js"
 import { localStorageMock } from "../__mocks__/localStorage.js"
 import { ROUTES, ROUTES_PATH } from "../constants/routes";
 import firestore from "../app/Firestore.js";
 import firebase from "../__mocks__/firebase";
 
 
 describe("Given I am connected as an employee", () => {
   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
   window.localStorage.setItem('user', JSON.stringify({
     type: 'Employee'
   }))
 
   // test function handleChangeFile -> Bon ou mouvais format de fichier
   describe("When i change file", () => {
     test("Then the function handleChangeFile is called", () => {
       const html = NewBillUI()
       document.body.innerHTML = html
       
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({pathname})
       }
       const newBill = new NewBill({document, onNavigate, firestore: null, localStorage: window.localStorage,})
       const handleChangeFile=jest.fn(newBill.handleChangeFile)
       const file = screen.getByTestId("file")
       file.addEventListener("change", handleChangeFile)
       fireEvent.change(file, {
         target: {
             files: [new File(["text.txt"], "text.txt", { type: "text/txt" })],
         }
       })
       expect(handleChangeFile).toBeCalled()
       expect(document.querySelector("#errorMessagId").style.display).toBe("block");
     })
   })
 
   // test message d'erreur
   describe("When i change file", () => {
     test("Then the error message = none", () => {
       const html = NewBillUI()
       document.body.innerHTML = html
       
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({pathname})
       }
       const firestore = {
         storage: {
           ref: jest.fn(() => {
             return {
               put: jest
                 .fn()
                 .mockResolvedValueOnce({ ref: { getDownloadURL: jest.fn() } }),
             };
           }),
         },
       };
       const newBill = new NewBill({document, onNavigate, firestore, localStorage: window.localStorage,})
       const handleChangeFile=jest.fn(newBill.handleChangeFile)
       const file = screen.getByTestId("file")
       file.addEventListener("change", handleChangeFile)
       fireEvent.change(file, {
         target: {
           files: [new File(["image"], "image.jpg", { type: "image/jpg" })],
         }
       })
       expect(file.files.length).toEqual(1);
       expect(document.querySelector("#errorMessagId").style.display).toBe("none");
     })
   })
 
   //test function handleSubmit
   describe("When I'm on NewBill page and click on submit btn", () => {
     test("Then the function handleSubmit should be called", () => {
       const html = NewBillUI();
       document.body.innerHTML = html;
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname })
       }
       const newBill = new NewBill({document,onNavigate,firestore: null,localStorage: window.localStorage, });
 
       const form = document.querySelector(`form[data-testid="form-new-bill"]`);
       const handleSubmit = jest.fn(newBill.handleSubmit);
       form.addEventListener("submit", handleSubmit);
       fireEvent.submit(form);
       expect(handleSubmit).toHaveBeenCalled();
     });
   });
   
 })
 
 
 
 // test d'intégration post
 describe("Given I am a user connected as employee", () => {
   describe("When I navigate to Bill employee page", () => {
     
     test("Add bill to mock API POST", async () => {
       const postSpy = jest.spyOn(firebase, "post")
       const newBill = {
         "id": "47qAXb6fIm2zOKkLzMro",
         "vat": "80",
         "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
         "status": "pending",
         "type": "Hôtel et logement",
         "commentary": "séminaire billed",
         "name": "encore",
         "fileName": "preview-facture-free-201801-pdf-1.jpg",
         "date": "2004-04-04",
         "amount": 400,
         "commentAdmin": "ok",
         "email": "a@a",
         "pct": 20
       }
       const bills = await firebase.post(newBill)
       expect(postSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(1)
     });
   
     test("fetches bills from mock API Post", async () => {
        const postSpy = jest.spyOn(firebase, "post")
        const bills = await firebase.post()
        expect(postSpy).toHaveBeenCalledTimes(2)
        expect(bills.data.length).toBe(1)
     })
     test("fetches bills from an API and fails with 404 message error", async () => {
       firebase.post.mockImplementationOnce(() =>
         Promise.reject(new Error("Erreur 404"))
       )
       const html = BillsUI({ error: "Erreur 404" })
       document.body.innerHTML = html
       const message = await screen.getByText(/Erreur 404/)
       expect(message).toBeTruthy()
     })
     test("fetches messages from an API and fails with 500 message error", async () => {
       firebase.post.mockImplementationOnce(() =>
         Promise.reject(new Error("Erreur 500"))
       )
       const html = BillsUI({ error: "Erreur 500" })
       document.body.innerHTML = html
       const message = await screen.getByText(/Erreur 500/)
       expect(message).toBeTruthy()
     })
   })
 })