import { Get, Patch, Post, Delete, Put } from "@mayajs/common";
import { MayaJsContext } from "@mayajs/router";
import { Controller } from "@mayajs/core";
import { ItemselltransServices } from "../services/itemselltrans.service";

@Controller()
export class ItemselltransController {
  constructor(private services: ItemselltransServices) {}

  @Post()
  async createItemselltrans({ body }: MayaJsContext): Promise<any> {
    body.createdBy = "Manual edit";
    body.editedBy = "Manual edit";
    return await this.services.savetransaction(body);
  }

  @Get()
  async readItemselltrans(): Promise<any> {
    return await this.services.getalltransactions();
  }
  @Get("/translist")
  async readItemselltranslist(): Promise<any> {
    return await this.services.getalltransactionslist();
  }
  @Post("/reporttrans")
  async reporttranslist({ body }: MayaJsContext): Promise<any> {
    return await this.services.getallreporttrans(body);
  }
  @Post("/salesperitem")
  async reportsalesperitem({ body }: MayaJsContext): Promise<any> {
    return await this.services.getallreportitemsales(body);
  }

  @Get("/:id")
  async readItemselltransByID({ params }: MayaJsContext): Promise<any> {
    return this.services.getspeciftransaction(params.id);
  }

  @Put("/:id")
  async replaceItemselltrans({ body, params }: MayaJsContext): Promise<any> {
    // Replace Itemselltrans from list
    return { message: "From ItemselltransController PUT route", body, params };
  }

  @Patch("/:id")
  async updateItemselltrans({ body, params }: MayaJsContext): Promise<any> {
    // Update Itemselltrans from list
    return {
      message: "From ItemselltransController PATCH route",
      body,
      params,
    };
  }

  @Delete("/:id")
  async deleteItemselltrans({ params }: MayaJsContext): Promise<any> {
    // Delete Itemselltrans from list
    return { message: "From ItemselltransController DELETE route", params };
  }
}
