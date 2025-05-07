import {HttpClient, HttpEventType} from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {LoyaltyPointBalance} from '../../../../models/loyalty-point-balance';
import {Reward} from '../../../../models/reward';
import {RewardCreatorService} from '../../../../services/rpx-logged-in/business-menu/reward-creator/reward-creator.service';
import {environment} from '../../../../../environments/environment';
import * as rpxGlobals from '../../../../globals';
import {Preferences} from '@capacitor/preferences';

const REWARD_MEDIA_UPLOAD_API_URL = `${rpxGlobals.API}reward/upload-media`;
const REWARD_MEDIA_MAX_UPLOAD_SIZE = 25e6;

const QR_CODE_CALIM_REWARD_SCAN_BASE_URL = environment.qrCodeRewardScanBaseUrl;

@Component({
  selector: 'app-reward-creator',
  templateUrl: './reward-creator.component.html',
  styleUrls: ['./reward-creator.component.css'],
})
export class RewardCreatorComponent implements OnInit {
  @Input() reward: Reward;

  @ViewChild('spbInputInfo') spbInputInfo;
  @ViewChild('rewardMediaInput') rewardMediaInput;
  @ViewChild('spbTopAnchor') spbTopAnchor;

  @Output() closeParentWindowEvt = new EventEmitter();
  @Output() closeRewardCreatorEvt = new EventEmitter();
  @Output() closeRewardCreatorAndRefetchRewardListEvt = new EventEmitter();

  loading = false;
  rewardCreatorForm: UntypedFormGroup;
  rewardCreatorFormUp = false;
  rewardClaimUrl: string = null;
  rewardFormSubmitted = false;
  rewardUploadImage = '../../assets/images/home_imgs/find-places-to-eat.svg';
  rewardMediaMessage = 'Upload Reward Image';
  rewardMediaUploadProgress = 0;
  businessPointsDollarValue = '0';
  dollarValueCalculated = false;
  rewardTypeList: Array<string> = ['Something From Our Menu', 'Discount'];
  rewardCreated = false;
  rewardDeleted = false;
  uploadMediaForm = false;
  loyaltyPointBalance: LoyaltyPointBalance;
  qrCodeClaimReward = QR_CODE_CALIM_REWARD_SCAN_BASE_URL;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private rewardCreatorService: RewardCreatorService,
    private http: HttpClient
  ) {}

  get rewardType() {
    return this.rewardCreatorForm.get('rewardType').value;
  }
  get rewardValue() {
    return this.rewardCreatorForm.get('rewardValue').value;
  }
  get rewardName() {
    return this.rewardCreatorForm.get('rewardName').value;
  }
  get rewardDescription() {
    return this.rewardCreatorForm.get('rewardDescription').value;
  }
  get rewardImage() {
    return this.rewardCreatorForm.get('rewardImage').value;
  }

  get f() {
    return this.rewardCreatorForm.controls;
  }

  initRewardForm() {
    const rewardTypeValidators = [Validators.required];
    const rewardValueValidators = [Validators.required];

    const rewardNameValidators = [
      Validators.required,
      Validators.maxLength(50),
    ];
    const rewardDescriptionValidators = [
      Validators.required,
      Validators.maxLength(250),
      Validators.minLength(50),
    ];

    const rewardImageValidators = [Validators.required];

    this.rewardCreatorForm = this.formBuilder.group({
      rewardType: ['', rewardTypeValidators],
      rewardValue: ['', rewardValueValidators],
      rewardName: ['', rewardNameValidators],
      rewardDescription: ['', rewardDescriptionValidators],
      rewardImage: ['', rewardImageValidators],
    });

    if (this.reward) {
      this.rewardCreatorForm.get('rewardType').setValue(this.reward.type);
      this.rewardCreatorForm
        .get('rewardValue')
        .setValue(this.reward.point_cost);
      this.rewardCreatorForm.get('rewardName').setValue(this.reward.name);
      this.rewardCreatorForm
        .get('rewardDescription')
        .setValue(this.reward.description);
      this.rewardCreatorForm.get('rewardImage').setValue(this.reward.images);
      this.rewardUploadImage = this.reward.images;

      this.setRewardLink();

      this.calculateDollarValue();
    }

    this.rewardCreatorFormUp = true;
    this.loading = false;
  }

  setReward(reward: Reward) {
    this.reward = reward;
    this.setRewardLink();
  }

  private setRewardLink() {
    this.rewardClaimUrl = `${this.qrCodeClaimReward}?&r=${this.reward.uuid}&t=claim_reward`;
  }

  calculateDollarValue() {
    const pointPercentage =
      this.loyaltyPointBalance.loyalty_point_dollar_percent_value;
    const itemPrice = this.rewardValue;

    if (pointPercentage === 0 || pointPercentage === null) {
      this.businessPointsDollarValue = '0';
    } else {
      this.businessPointsDollarValue = (
        itemPrice *
        (pointPercentage / 100)
      ).toFixed(2);
    }

    this.dollarValueCalculated = true;
  }

  saveReward() {
    this.rewardFormSubmitted = true;
    this.spbTopAnchor.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    const itemObj = new Reward();

    itemObj.name = this.rewardName;
    itemObj.description = this.rewardDescription;
    itemObj.images = this.rewardImage;
    itemObj.point_cost = this.rewardValue;
    itemObj.type = this.rewardType;

    if (!this.reward) {
      this.rewardCreatorService.saveItem(itemObj).subscribe(resp => {
        this.saveRewardCb(resp);
      });
    } else {
      itemObj.id = this.reward.id;

      this.rewardCreatorService.updateItem(itemObj).subscribe(resp => {
        this.saveRewardCb(resp);
      });
    }
  }

  saveRewardCb(resp: any) {
    console.log(resp);

    if (resp.success) {
      this.rewardCreated = true;
      setTimeout(() => {
        this.closeRewardCreatorAndRefetchRewardList();
      }, 1500);
    }
  }

  startRewardMediaUploader(): void {
    this.rewardMediaInput.nativeElement.click();
  }

  async uploadMedia(files) {
    const fileListLength = files.length;

    if (fileListLength === 0) {
      this.rewardMediaMessage = 'You must upload at least one file.';
      return;
    } else if (fileListLength > 1) {
      this.rewardMediaMessage = 'Upload only one item image.';
      return;
    }

    this.loading = true;

    const formData = new FormData();

    let file_to_upload;
    let upload_size = 0;

    for (let i = 0; i < fileListLength; i++) {
      file_to_upload = files[i] as File;

      upload_size += file_to_upload.size;

      if (upload_size > REWARD_MEDIA_MAX_UPLOAD_SIZE) {
        this.rewardMediaMessage = 'Max upload size is 25MB.';
        this.loading = false;
        return;
      }

      formData.append('image', file_to_upload, file_to_upload.name);
    }

    const tokenRet = await Preferences.get({key: 'rpxcom_session'});
    const token = tokenRet.value;

    this.http
      .post(REWARD_MEDIA_UPLOAD_API_URL, formData, {
        reportProgress: true,
        observe: 'events',
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.rewardMediaUploadProgress = Math.round(
            (100 * event.loaded) / event.total
          );
        } else if (event.type === HttpEventType.Response) {
          this.rewardMediaUploadFinished(event.body);
        }
      });

    return;
  }

  private rewardMediaUploadFinished(httpResponse: any): void {
    if (httpResponse.success) {
      this.rewardUploadImage = httpResponse.image;

      this.rewardCreatorForm
        .get('rewardImage')
        .setValue(this.rewardUploadImage);
    } else {
      console.log('rewardMediaUploadFinished', httpResponse);
    }

    this.loading = false;
  }

  rewardTypeChange() {
    if (this.rewardType === 0) {
      //reward is discount
      this.uploadMediaForm = true;

      this.rewardUploadImage = this.reward.images;
    } else {
      //reward is somethign from our menu
      this.uploadMediaForm = false;
    }
  }

  closeRewardCreator() {
    this.closeRewardCreatorEvt.emit();
  }

  closeWindow() {
    this.closeParentWindowEvt.emit();
  }

  closeRewardCreatorAndRefetchRewardList() {
    this.closeRewardCreatorAndRefetchRewardListEvt.emit();
  }

  deleteMe() {
    this.rewardCreatorService.deleteMe(this.reward).subscribe(resp => {
      this.deleteMeCb(resp);
    });
  }

  private deleteMeCb(resp) {
    if (resp.success) {
      this.rewardDeleted = true;
      setTimeout(() => {
        this.closeRewardCreatorAndRefetchRewardList();
      }, 1500);
    }
  }

  ngOnInit(): void {
    this.initRewardForm();
  }
}
