import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';



export interface PokemonData {
  id: number;
  name: string;
  type: string;
  abilities: string[];
}

@Component({
  selector: 'app-tabela',
  templateUrl: './tabela.component.html',
  styleUrls: ['./tabela.component.scss']
})
export class TabelaComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'type', 'abilities'];
  dataSource = new MatTableDataSource<PokemonData>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=100').subscribe(data => {
      const pokemonDataPromises: Promise<PokemonData>[] = data.results.map((result: any, index: number) => {
        const id = index + 1;
        const pokemonUrl = result.url;
        return this.http.get<any>(pokemonUrl).toPromise().then(pokemonDetails => {
          const abilities = pokemonDetails.abilities.map((ability: any) => ability.ability.name);
          const type = pokemonDetails.types[0].type.name;
          return { id, name: result.name, type, abilities };
        });
      });

      Promise.all(pokemonDataPromises).then(pokemonData => {
        this.dataSource.data = pokemonData; 
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
