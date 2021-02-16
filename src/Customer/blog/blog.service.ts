import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';

@Injectable()
export class BlogService {
  create(createBlogDto: CreateBlogDto) {
    return 'This action adds a new blog';
  }

  findAll() {
    return `This action returns all blog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
