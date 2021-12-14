/**
 * @jest-environment jsdom
 */

// In test the "{ ... }" is for the testing chaines
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes";

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  // test function handleChangeFile -> Bon ou mouvais format de fichier
  describe("When i change file", () => {
    test("Then the function handleChangeFile is called", () => {
      // context
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      // create a NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      })
      // get handleSubmit function
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const file = screen.getByTestId("file")
      file.addEventListener("change", handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(["text.txt"], "text.txt", {
            type: "text/txt"
          })],
        }
      })
      expect(handleChangeFile).toBeCalled()
      expect(document.querySelector("#errorMessagId").style.display).toBe("block");
    })




    // test message d'erreur
    test("Then the error message = none", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      const firestore = {
        storage: {
          ref: jest.fn(() => {
            return {
              put: jest
                .fn()
                .mockResolvedValueOnce({
                  ref: {
                    getDownloadURL: jest.fn()
                  }
                }),
            };
          }),
        },
      };
      // create a newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      })
      // get handleChangeFile function
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const file = screen.getByTestId("file")
      file.addEventListener("change", handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(["image"], "image.jpg", {
            type: "image/jpg"
          })],
        }
      })
      // test
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
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      // create a NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      // get the form
      const form = document.querySelector(`form[data-testid="form-new-bill"]`);
      // get handleSubmit function
      const handleSubmit = jest.fn(newBill.handleSubmit);
      // listen the submit
      form.addEventListener("submit", handleSubmit);
      // simulated a btn type "submit"
      fireEvent.submit(form);
      // test
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
