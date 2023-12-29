import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  ageForm: FormGroup;
  age: number = 0;
  ageYears: number = 0;
  ageMonths: number = 0;
  ageDays: number = 0;
  maxDays: number = 31;

  constructor(private fb: FormBuilder) {
    this.ageForm = this.fb.group({
      'day': ['', [Validators.required, Validators.min(1), Validators.max(31)]],
      'month': ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      'year': ['', Validators.required],
    }, { validators: this.futureDateValidator });
  }

  ngOnInit(): void {
    this.ageForm.get('month')?.valueChanges.subscribe(() => {
      this.setDaysValidators();
    });
  }

  setDaysValidators(): void {
    const selectedMonth = this.ageForm.get('month')?.value;
    const year = this.ageForm.get('year')?.value;
    if (selectedMonth === 2) {
      this.validateLeapYear();
    } else {
      this.maxDays = this.daysInMonth(selectedMonth - 1, year);
    }
    const dayControl = this.ageForm.get('day');
    dayControl?.setValidators([Validators.required, Validators.min(1), Validators.max(this.maxDays)]);
    dayControl?.updateValueAndValidity();
  }

  daysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  validateLeapYear(): void {
    const year = this.ageForm.get('year')?.value;
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      this.maxDays = 29;
    } else {
      this.maxDays = 28;
    }
  }

  futureDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const day = control.get('day')?.value;
    const month = control.get('month')?.value;
    const year = control.get('year')?.value;
    if (!day || !month || !year) {
      return null;
    }
    if (day && month && year) {
      const selectedDate = new Date(`${year}-${month}-${day}`);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        return { 'futureDate': true };
      }
    }
    return null;
  }

  submitForm(): void {
    if (this.ageForm.valid) {
      let date = new Date();
      this.ageYears = date.getFullYear() - this.ageForm.get('year')?.value;
      this.ageMonths = date.getMonth() + 1 - this.ageForm.get('month')?.value;
      this.ageDays = Math.abs(date.getDate() - this.ageForm.get('day')?.value);
    } else {
      this.ageForm.markAllAsTouched();
    }
  }

}
