/**
 * @jest-environment jsdom
 */

import {
  screen,
  fireEvent
} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {
  bills
} from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import Router from '../app/Router.js'
import {
  localStorageMock
} from "../__mocks__/localStorage.js";
import {
  ROUTES,
  ROUTES_PATH
} from "../constants/routes"
import Firestore from "../app/Firestore";
import firebase from "../__mocks__/firebase";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({
        data: []
      })
      document.body.innerHTML = html
      //to-do write expect expression
    })
  })



  // from another repo to understand
  describe('when i click on the eye icon button', () => {
    test('then a modal should open', () => {
      // Context
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
      // Things to test
      $.fn.modal = jest.fn()
      const button = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn((e) => {
        e.preventDefault()
        bill.handleClickIconEye(button)
      })
      // What actions
      button.addEventListener('click', handleClickIconEye)
      fireEvent.click(button)
      // test
      expect(handleClickIconEye).toHaveBeenCalled()
    })
  })






  // TEST 1
  /*
  describe("When I click on button new bill", () => {
    
    test("Then HandleClickBill function should be called", () => { // test unitaire
      // Verifie l'appele de la fonction au click sur le bouton
      const HandleClickBill = jest.fn(bills.HandleClickBill); // fonction
      const buttonNewBill = screen.getByTestId("btn-new-bill"); // button
      buttonNewBill.addEventListener("click", HandleClickBill);
      // fireEvent.submit(buttonNewBill)

      expect(HandleClickBill).toBeCalled(1)

    })
    */
    /*
    test('Then it should display the New Bill Page', () => {
            const handleClickNewBill = jest.fn(billsList.handleClickNewBill)
            const buttonNewBill = screen.getByTestId('btn-new-bill')
            expect(buttonNewBill).toBeTruthy()
            buttonNewBill.addEventListener('click', handleClickNewBill)
            fireEvent.click(buttonNewBill)
            expect(screen.getByText('Envoyer une note de frais')).toBeTruthy() 
          }) 
    */
  })


  // TEST 2
  describe("When I click on the icon eye", () => {
    test("handleClickIconEye should be called", () => { // test unitaire
      const iconEye = screen.getByTestId("icon-eye");
      const handleClickIconEye = jest.fn(bills.handleClickIconEye);
      iconEye.addEventListener("click", handleClickIconEye);

      expect(handleClickIconEye).toBeCalled

    })
  })



// test the order invoices
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