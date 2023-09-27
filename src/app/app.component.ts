import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  invoiceForm!: FormGroup;
  items!: FormArray;

  matcher = new MyErrorStateMatcher();
  constructor(private _formBuilder: FormBuilder) {
    this.invoiceForm = this._formBuilder.group({
      owner_name: ['', Validators.required],
      owner_address: ['', Validators.required],
      owner_phone: ['', Validators.required],
      owner_email: ['', Validators.required, , Validators.email],
      buyer_name: ['', Validators.required],
      buyer_address: ['', Validators.required],
      buyer_phone: ['', Validators.required],
      buyer_email: ['', Validators.required, , Validators.email],
      invoice_number: ['', Validators.required],
      invoice_date: ['', Validators.required],
      payment_due: ['', Validators.required],
      items: this._formBuilder.array([]),
    });
  }

  get itemsDetails() {
    if (this.invoiceForm.get('items')?.invalid) {
    }
    return (this.invoiceForm.get('items') as FormArray).controls;
  }

  GetItems(): FormGroup {
    return new FormGroup({
      item: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      amount: new FormControl('', Validators.required),
    });
  }

  AddItem() {
    this.items = this.invoiceForm.get('items') as FormArray;
    this.items.push(this.GetItems());
  }

  ngOnInit(): void {
    for (let i = 0; i < 1; i++) {
      this.AddItem();
    }
  }

  HandleSubmit() {
    const itemsArray = this.invoiceForm.get('items') as FormArray;
    itemsArray.markAllAsTouched();

    if (this.invoiceForm.invalid) {
      this.markFormGroupTouched(this.invoiceForm);
      return;
    }

    const formData = this.invoiceForm.value;
    const boldStyle = { bold: true };

    // Create an array to store all the content
    const content = [
      { text: 'Invoice Form', style: 'header' },
      // Add other content here...
    ];

    // Add form data to the content array
    content.push(
      {
        text: `Your Name/Business Name: ${formData.owner_name}`,
        style: 'owner_name',
      },
      {
        text: `Your Address: ${formData.owner_address}`,
        style: 'owner_name',
      },
      {
        text: `Your Phone number: ${formData.owner_phone}`,
        style: 'owner_name',
      },
      { text: `Your email: ${formData.owner_email}`, style: 'owner_address' },
      { text: 'Bill to:', style: 'sub_header' },
      {
        text: `Buyer Name/Business Name: ${formData.buyer_name}`,
        style: 'owner_name',
      },
      {
        text: `Buyer Address: ${formData.buyer_address}`,
        style: 'owner_name',
      },
      {
        text: `Buyer Phone number: ${formData.buyer_phone}`,
        style: 'owner_name',
      },
      { text: `Buyer email: ${formData.buyer_email}`, style: 'owner_name' },
      {
        text: `Invoice number: ${formData.invoice_number}`,
        style: 'owner_name',
      },
      {
        text: `Invoice date: ${formData.invoice_date}`,
        style: 'owner_name',
      },
      { text: `Payment due: ${formData.payment_due}`, style: 'owner_name' }
    );

    // Add table for items
    const itemsTable = {
      text: '',
      style: 'tableExample',
      table: {
        widths: ['*', '*', '*', '*'],
        body: [[
          { text: "Item", style: 'tableHeader' },
          { text: "Quantity", style: 'tableHeader' },
          { text: "Price per unit", style: 'tableHeader' },
          { text: "Amount", style: 'tableHeader' }
        ]],
      },
    };

    // Add items data to the table
    formData.items.forEach((item: any) => {
      itemsTable.table.body.push([
        item.item,
        item.quantity,
        item.price,
        item.amount,
      ]);
    });

    itemsTable.table.body.push([
      { text: '', style: 'boldText' },
      { text: '', style: 'boldText' },
      { text: 'Subtotal', style: 'boldText' },
      { text: '$0.00', style: 'boldText' },
    ]);
    itemsTable.table.body.push([
      { text: '', style: 'boldText' },
      { text: '', style: 'boldText' },
      { text: 'Tax 0.00%', style: 'boldText' },
      { text: '$0.00', style: 'boldText' },
    ]);
    itemsTable.table.body.push([
      { text: '', style: 'boldText' },
      { text: '', style: 'boldText' },
      { text: 'Fees/discounts', style: 'boldText' },
      { text: '$0.00', style: 'boldText' },
    ]);
    itemsTable.table.body.push([
      { text: '', style: 'boldText' },
      { text: '', style: 'boldText' },
      { text: 'TOTAL', style: 'boldText' },
      { text: '$0.00', style: 'boldText' },
    ]);

    // content.push(itemsTable);
    content.push({...itemsTable });

    const docDefinition: any = {
      content: content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        sub_header: {
          margin: [0, 10, 0, 4],
          bold: true,
          fontWeight: 700,
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        owner_name:{
          margin:[0, 0, 0,5]
        },
        boldText: {
          bold: true
        },
        tableHeader: {
          fillColor: '#AAAAAA',
          color: 'white',
          bold: true
        }
      },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);

    // Open the PDF in a new tab
    pdfDoc.open();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}
