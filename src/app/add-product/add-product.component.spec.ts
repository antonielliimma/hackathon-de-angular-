import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductsService } from '../services/products.service';
import { SharedModule } from '../shared/shared.module';
import { AddProductComponent } from './add-product.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let dialogRef: MatDialogRef<AddProductComponent>;
  let matSnackBar = jasmine.createSpyObj('MatSnackbar', ['open']);
  let mockProductService = jasmine.createSpyObj('ProductsService', [
    'updateProduct',
    'saveProduct',
  ]);
  let mockDialogRef: any;

  beforeEach(async () => {
    mockDialogRef = {
      close: jasmine.createSpy('close')
    };    
    await TestBed.configureTestingModule({
      declarations: [ AddProductComponent ],
      imports: [ ReactiveFormsModule, MatDialogModule ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatSnackBar, useValue: matSnackBar },
        { provide: ProductsService, useValue: mockProductService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init the form', () => {
    component.ngOnInit();
    expect(component.productForm).toBeDefined();
    expect(component.productForm.controls['title']).toBeDefined();
    expect(component.productForm.controls['price']).toBeDefined();   
  });

  describe('should test add product functionality', () => {
    it('should call the saveProduct to add new product', () => {
      const productData = { title: 'Test Product', price: 100, description: 'teste', category: 'categoria' };
      component.productForm.setValue(productData);
      mockProductService.saveProduct.and.returnValue(of(productData));

      component.saveProduct();

      expect(mockProductService.saveProduct).toHaveBeenCalledWith(productData);
      expect(matSnackBar.open).toHaveBeenCalledWith('Added Successfully!...', '', {
        duration: 3000,
      });     
    });

    it('should test the saveProduct for failure while add a new product', () => {
      const productData = { title: 'Test Product', price: 100, description: 'teste', category: 'categoria' };
      component.productForm.setValue(productData);
      const errorResponse = new Error('Failed to add product');
      mockProductService.saveProduct.and.returnValue(of(errorResponse));
    
      component.saveProduct();
    
      expect(mockProductService.saveProduct).toHaveBeenCalledWith(productData);     
    });
  });
  
  describe('should test edit product functionality', () => {
    it('should set the form controls to the correct values when data is provided', () => {
      const productData = { title: 'Edited Product', price: '150', description: 'teste', category: 'categoria' };
      component.data = productData;
      component.ngOnInit();
      expect(component.productForm.controls['title'].value).toBe(productData.title);
      expect(component.productForm.controls['price'].value).toBe(productData.price);      
    });

    it('should call the saveProduct while editing the product', () => {
      const productData = { id: '10', title: 'Title Product', price: '150', description: 'teste', category: 'categoria' };
      component.data = productData;
      component.ngOnInit();

      const productEdit = {title: 'Edited Product', price: '150', description: 'Updated description', category: 'Updated category' };
      component.productForm.setValue(productEdit);
      mockProductService.updateProduct.and.returnValue(of(productEdit));

      component.saveProduct();
        
      expect(matSnackBar.open).toHaveBeenCalledWith('Updated Successfully!...', '', {
        duration: 3000,
      });      
    });


    it('should test the saveProduct for failure while update a product', () => {
      const data: Product = {
        id: '1',
        title: 'Test Product',
        description: 'Test description',
        price: '19.99',
        category: 'Test category'
      };
      const error = new Error('Error while update a product');
      component.data = data;

      mockProductService.updateProduct.and.returnValue((throwError(() => error)));
      component.productForm.patchValue(data);
      component.saveProduct();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(data);
      expect(matSnackBar.open).toHaveBeenCalledWith('Something went wrong!...', '', {
        duration: 3000
      });
    });
  });
});
