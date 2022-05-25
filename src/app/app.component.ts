import { Component, ViewChild, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UsersService } from './services/users.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

export interface PeriodicElement {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['select', 'id', 'name', 'email', 'role', 'action'];
  dataToDisplay = [];
  dataSource = new MatTableDataSource<PeriodicElement>(this.dataToDisplay);
  selection = new SelectionModel<PeriodicElement>(true, []);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editable: boolean;
  editableIndex: number;

  profileForm: FormGroup;

  constructor(private service: UsersService, private fb: FormBuilder) {
    this.editable = false;
  }

  ngOnInit(): void {
    this.getMembers();

    this.profileForm = this.fb.group({
      id: [null, Validators.required],
      name: [null, Validators.required],
      email: [null, Validators.required],
      role: [null, Validators.required]
    });
  }

  getMembers() {
    this.service.getMembers().subscribe(response => {
      this.dataToDisplay = [...response];
      
      this.applyChangesToDataTable();
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  removeData(param?) {
    if (param) {
      const index = this.dataToDisplay.indexOf(param);
      this.dataToDisplay.splice(index, 1);
    }

    if (this.selection.selected.length > 0) {
      this.selection.selected.map(selectedRow => {
        const index = this.dataToDisplay.indexOf(selectedRow);
        this.dataToDisplay.splice(index, 1);
      });
      this.selection.clear();
    }

    this.applyChangesToDataTable();
  }

  editData(param) {
    this.editable = true;
    this.editableIndex = param.id;
    this.profileForm.setValue(param);
  }

  saveData(param) {
    this.dataToDisplay.map( (data, index) => {
      if (data.id == param.id) {
        this.dataToDisplay[index] = {...this.profileForm.value}
      }
    });
    this.editable = false;

    this.applyChangesToDataTable();
  }

  applyChangesToDataTable() {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.dataToDisplay);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
