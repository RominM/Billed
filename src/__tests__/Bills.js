/**
 * @jest-environment jsdom
 */
 import { fireEvent, screen, getByTestId } from "@testing-library/dom"
 import userEvent from '@testing-library/user-event'
 import BillsUI from "../views/BillsUI.js"
 import { bills } from "../fixtures/bills.js"
 import { ROUTES } from "../constants/routes"
 import Bills from "../containers/Bills.js"
 import firebase from "../__mocks__/firebase"
 import Logout from "../containers/Logout.js"
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
     //............................
     describe('When I am on Bills page but back-end send an error message', () => {
      test('Then, Error page should be rendered', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })
    })
    
     // Test ordre d'affichage notes de frais
     test("Then bills should be ordered from earliest to latest", () => {
       const html = BillsUI({ data: bills })
       document.body.innerHTML = html
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = [...dates].sort(antiChrono)
       expect(dates).toEqual(datesSorted)
     })
 
     //.....
    
    describe('Given I am connected as Employee and I am on Bills page and I clicked on a bill', () => {
      describe('When I click on the icon eye', () => {
        test('A modal should open', () => {
          const html = BillsUI({data:bills})
          document.body.innerHTML = html
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({pathname})
          }
          const bill = new Bills({document, onNavigate, firestore: null, localStorage: window.localStorage,})
          
          $.fn.modal = jest.fn();

          const eye = screen.getAllByTestId('icon-eye')[1]
          const handleClickIconEye = jest.fn(bill, "handleClickIconEye")
          eye.addEventListener("click", () => bill.handleClickIconEye(eye));
          userEvent.click(eye);
          expect($.fn.modal).toHaveBeenCalled();

          expect(document.querySelector("#modaleFile")).toBeTruthy();
          expect(document.querySelector("#modaleFile").getAttribute("style")).not.toBe("display: none;");

          const modale = screen.getByTestId('modaleFileTest')
          expect(modale).toBeTruthy()

        })
      })
    })
    
   //
   describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
   })

    //test function handleClickNewBill -> ouverture de form
    describe("When I click on new bill button", () => {
      test("Then function handleClickNewBill is called and I navigate to new bill page", () => {
        const html = BillsUI({data:[]})
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
        const bill = new Bills({document, onNavigate, firestore: null, localStorage: window.localStorage,})
        const handleClickNewBill = jest.fn(bill.handleClickNewBill)
        const btnNewBill = screen.getByTestId('btn-new-bill')
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()
      })
    })

    //test function handleClick -> deconnecter 
    describe("When I click on disconnected button", () => {
      test("Then function handleClick is called", () => {
        const html = BillsUI({data:[]})
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({pathname})
        }
        const billD = new Logout({document, onNavigate, firestore: null, localStorage: window.localStorage,})
        const handleClick = jest.fn(billD.handleClick)
        const btnDisconnect = screen.getByTestId('layout-disconnect')
        btnDisconnect.addEventListener('click', handleClick)
        userEvent.click(btnDisconnect)
        expect(handleClick).toHaveBeenCalled()
      })
    })
   })
  })

// test d'intégration GET
describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Bill employee page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})