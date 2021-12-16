/**
 * @jest-environment jsdom
 */

import {
  screen
} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {
  bills
} from "../fixtures/bills.js"
import firestore from "../app/Firestore.js"
import Router from "../app/Router.js"
import {
  ROUTES_PATH
} from "../constants/routes.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // must verify if the container (<div data-testid="icon-window">) have CSS "active-icon" class
      const mockBills = jest.fn(() => {
        return {
          get: jest.fn().mockResolvedValue(bills)// return the fixture bills
        }
      })
      firestore.bills = mockBills

      function getCurrentUser(user) {
        if (user == "user") {
          const currentUser = {
            email: "charles-atan@hotmail.fr",
            type: "Employee"
          }
          return JSON.stringify(currentUser)
        }
        return null
      }

      Object.defineProperty(window, "localStorage", {
        value: { // value of localStorage in window object
          getItem: jest.fn(getCurrentUser),
          setItem: jest.fn(() => null)
        },
        writable: true // you can change the value outside
      })

      Object.defineProperty(window, "location", {
        value: { // value of location in window object
          hash: ROUTES_PATH["Bills"],
          pathname: ROUTES_PATH["Bills"]
        },
        writable: true // you can change the value outside
      })

      const RouterMock = jest.fn(Router)
      document.body.innerHTML = '<div id="root"></div>'
      RouterMock()
      const windowIcon = screen.getByTestId("icon-window")

      expect(RouterMock).toHaveBeenCalled()
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
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
  })
})