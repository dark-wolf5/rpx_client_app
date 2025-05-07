import {Component, OnInit} from '@angular/core';
import {IonicModule, ModalController} from '@ionic/angular';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {Feedback} from '../../../../models/feedback';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, IonicModule],
})
export class FeedbackComponent implements OnInit {
  feedback: Feedback;
  ledgerId: string;
  businessName: string;

  feedbackForm: UntypedFormGroup;
  formSavedFailed$ = new BehaviorSubject(false);
  formSavedSuccessfully$ = new BehaviorSubject(false);
  formSubmitted$ = new BehaviorSubject(false);

  constructor(
    private modalCtrl: ModalController,
    private feedbackService: LoyaltyPointsService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.feedbackForm = this.formBuilder.group({
      feedbackText: [
        '',
        [
          Validators.required,
          Validators.maxLength(1500),
          Validators.minLength(100),
        ],
      ],
    });

    if (this.feedback?.feedback_text) {
      this.feedbackForm
        .get('feedbackText')
        .setValue(this.feedback.feedback_text);
    }
  }

  get feedbackText() {
    return this.feedbackForm.get('feedbackText').value;
  }

  get f() {
    return this.feedbackForm.controls;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.formSubmitted$.next(true);

    if (this.feedback?.uuid) {
      this.updateFeedback();
    } else {
      this.saveFeedback();
    }
  }

  saveFeedback() {
    if (this.feedbackForm.invalid) {
      return;
    }

    this.feedbackService
      .saveFeedback(this.feedbackText, this.ledgerId)
      .subscribe(resp => {
        if (resp) {
          this.formSavedSuccessfully$.next(true);
          setTimeout(
            () =>
              this.modalCtrl.dismiss(
                {feedback: resp.feedback},
                'feedback_sent'
              ),
            1500
          );
        } else {
          this.formSavedFailed$.next(true);
        }
      });
  }

  updateFeedback() {
    this.feedbackService
      .updateFeedback(this.feedbackText, this.feedback.uuid)
      .subscribe(
        resp => {
          this.formSavedSuccessfully$.next(true);
          setTimeout(
            () =>
              this.modalCtrl.dismiss(
                {feedback: {feedback_text: this.feedbackText}},
                'feedback_updated'
              ),
            1500
          );
        },
        error => {
          this.formSavedFailed$.next(true);
          console.log('updateFeedbackError', error);
          setTimeout(
            () => this.modalCtrl.dismiss(null, 'feedback_not_sent'),
            1500
          );
        }
      );
  }
}
