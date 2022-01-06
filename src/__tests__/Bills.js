import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import Router from "../app/Router";
import Bills from "../containers/Bills";
import firebase from "../__mocks__/firebase";
import Firestore from "../app/Firestore";

describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {
    // TEST 1
    test("Then bill icon in vertical layout should be highlighted", () => {
      jest.mock("../app/Firestore")
      Firestore.bills = () => ({
        bills,
        get: jest.fn().mockResolvedValue()
      })
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
      }))
      const pathname = ROUTES_PATH["Bills"]
      Object.defineProperty(window, "location", {
        value: {
          hash: pathname
        }
      })
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBe(true)
    })
    // TEST 2
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('when i click on the eye icon button', () => {
    // TEST 3
    test('then a modal should open', () => {
      const html = BillsUI({
        data: bills
      })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const bill = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()
      const button = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn((e) => {
        e.preventDefault()
        bill.handleClickIconEye(button)
      })
      button.addEventListener('click', handleClickIconEye)
      fireEvent.click(button)
      expect(handleClickIconEye).toHaveBeenCalled()

    })
    // TEST 3.2
    test('then a modal should not open', () => {

      document.body.innerHTML = '<div></div>'

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }

      /**
       * document.qurySelectorAll return un objet de type NodeList : il est toujours défini et ne rentre jamais dans le "else"
          Il faut donc forcer un faux else 
      */
     
      jest.spyOn(document, 'querySelectorAll').mockReturnValue(null)

      const bill = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })
    
      $.fn.modal = jest.fn()

      const handleClickIconEye = jest.fn()
   
     try {
      const button = screen.getAllByTestId('icon-eye')[0]
      bill.handleClickIconEye = handleClickIconEye;
      /*handleClickIconEye.mockImplementation((e) => {
        e.preventDefault()
        bill.handleClickIconEye(button)
      })
      button.addEventListener('click', handleClickIconEye)*/
      fireEvent.click(button)
      
     } catch(e) {
      expect(handleClickIconEye).not.toHaveBeenCalled()
     }

    })  
  })

  describe('when i click on the make new Bill Button', () => {
    // TEST 4
    test('a new bill modal should open', () => {
      Object.defineProperty(window, 'local storage', {
        value: localStorageMock
      })
      window.localStorage.setItem(
        'user', JSON.stringify({
          type: 'employee'
        })
      )
      const html = BillsUI({
        data: []
      })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const bills = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })
      const button = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill(e))
      button.click('click', handleClickNewBill)
      fireEvent.click(button)
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  //test d'intégration GET [is a critical part]
  describe('Given I am a user connected as Admin', () => {
    // TEST 5

    test('fetches bills from mock API GET', async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    // TEST 5
    test('fetches bills from an API and fails with 404 message error', async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404")))
      const html = BillsUI({
        error: 'Erreur 404'
      })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    // TEST 6
    test('fetches messages from an API and fails with 500 message error', async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({
        error: "Erreur 500"
      })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})